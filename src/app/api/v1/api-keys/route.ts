import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import crypto from 'crypto';
import { db } from '@/db';
import { apiKeys } from '@/db/schema';
import { AuthError, requireTenant } from '@/lib/auth';
import { requirePermission } from '@/lib/rbac';

const createSchema = z.object({ name: z.string().trim().min(1).max(255) });

export async function GET(req: NextRequest) {
  try {
    const { user, membership } = await requireTenant(req);
    await requirePermission(user.id, membership.organizationId, 'api_keys:manage');
    const keys = await db.select({
      id: apiKeys.id,
      name: apiKeys.name,
      lastUsedAt: apiKeys.lastUsedAt,
      expiresAt: apiKeys.expiresAt,
      createdAt: apiKeys.createdAt,
    }).from(apiKeys).where(eq(apiKeys.organizationId, membership.organizationId));
    return NextResponse.json({ keys });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error('List API keys failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, membership } = await requireTenant(req);
    await requirePermission(user.id, membership.organizationId, 'api_keys:manage');
    const { name } = createSchema.parse(await req.json());
    const rawKey = `nx_${crypto.randomBytes(32).toString('base64url')}`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    await db.insert(apiKeys).values({
      organizationId: membership.organizationId,
      userId: user.id,
      name,
      keyHash,
    });
    return NextResponse.json({ message: 'API key generated', key: rawKey }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Invalid request', details: error.flatten() }, { status: 400 });
    console.error('Create API key failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
