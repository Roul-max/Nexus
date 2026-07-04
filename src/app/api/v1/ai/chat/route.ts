import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { aiConversations, aiMessages } from '@/db/schema';
import { AuthError, requireTenant } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';

const requestSchema = z.object({
  prompt: z.string().trim().min(1).max(10_000),
  conversationId: z.string().uuid().optional(),
});

const systemInstruction = 'You are Nexus AI, a concise professional enterprise SaaS assistant.';

export async function POST(req: NextRequest) {
  try {
    const { token, user, membership } = await requireTenant(req);
    const rateLimit = await checkRateLimit('ai-chat', token.uid, 20, '1 m');
    if (!rateLimit.success) {
      return NextResponse.json({ error: 'AI request limit exceeded' }, { status: 429 });
    }

    const { prompt, conversationId } = requestSchema.parse(await req.json());
    let currentConversationId = conversationId;

    if (currentConversationId) {
      const conversation = await db.query.aiConversations.findFirst({
        where: and(
          eq(aiConversations.id, currentConversationId),
          eq(aiConversations.userId, user.id),
          eq(aiConversations.organizationId, membership.organizationId),
        ),
      });
      if (!conversation) throw new AuthError('Conversation not found in this organization', 404);
    } else {
      const [conversation] = await db.insert(aiConversations).values({
        organizationId: membership.organizationId,
        userId: user.id,
        title: prompt.slice(0, 50),
        contextType: 'general',
      }).returning();
      currentConversationId = conversation.id;
    }

    await db.insert(aiMessages).values({
      conversationId: currentConversationId,
      role: 'user',
      content: prompt,
    });

    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured');
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: { systemInstruction },
    });
    const text = response.text ?? '';

    await db.insert(aiMessages).values({
      conversationId: currentConversationId,
      role: 'assistant',
      content: text,
    });

    return NextResponse.json({ text, conversationId: currentConversationId });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Invalid request', details: error.flatten() }, { status: 400 });
    console.error('AI chat failed:', error);
    return NextResponse.json({ error: 'Failed to generate AI response' }, { status: 500 });
  }
}
