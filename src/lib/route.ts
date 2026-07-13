import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AuthError, requireTenant } from '@/lib/auth';
import { apiHandler } from '@/lib/api-handler';
import { checkAiChatRateLimit } from '@/lib/rate-limit';
import { getChatResponse } from '@/lib/gemini';

const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'model']),
      parts: z.array(z.object({ text: z.string() })),
    })
  ),
});

export const POST = apiHandler(async (req: NextRequest) => {
  try {
    const { token, user, membership } = await requireTenant(req);
    const rateLimit = await checkAiChatRateLimit(token.uid);
    if (!rateLimit.success) {
      return NextResponse.json({ error: 'AI request limit exceeded' }, { status: 429 });
    }

    const body = await req.json();
    const { messages } = chatSchema.parse(body);

    const responseText = await getChatResponse(messages);

    return NextResponse.json({
      data: {
        role: 'model',
        parts: [{ text: responseText }],
      },
    });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});