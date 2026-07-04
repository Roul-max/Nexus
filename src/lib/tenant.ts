import type { NextRequest } from 'next/server';
import { and, eq, gt, isNull, or } from 'drizzle-orm';
import crypto from 'crypto';
import { db } from '@/db';
import { apiKeys, organizationUsers } from '@/db/schema';
import { requireTenant } from '@/lib/auth';

export type TenantContext = {
  organizationId: string;
  userId: string;
  apiKeyId?: string;
};

export async function validateApiKey(req: NextRequest): Promise<TenantContext | null> {
  const header = req.headers.get('authorization');
  if (!header?.startsWith('Bearer nx_')) return null;

  const hash = crypto.createHash('sha256').update(header.slice(7)).digest('hex');
  const [key] = await db.select({
    id: apiKeys.id,
    organizationId: apiKeys.organizationId,
    userId: apiKeys.userId,
  }).from(apiKeys)
    .innerJoin(organizationUsers, and(
      eq(organizationUsers.userId, apiKeys.userId),
      eq(organizationUsers.organizationId, apiKeys.organizationId),
    ))
    .where(and(
      eq(apiKeys.keyHash, hash),
      or(isNull(apiKeys.expiresAt), gt(apiKeys.expiresAt, new Date())),
    ))
    .limit(1);

  if (!key) return null;
  void db.update(apiKeys).set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, key.id)).execute().catch(console.error);
  return { organizationId: key.organizationId, userId: key.userId, apiKeyId: key.id };
}

export function TenantMiddleware<T extends unknown[]>(
  handler: (req: NextRequest, context: TenantContext, ...args: T) => unknown,
) {
  return async (req: NextRequest, ...args: T) => {
    const apiKeyContext = await validateApiKey(req);
    if (apiKeyContext) return handler(req, apiKeyContext, ...args);

    const { user, membership } = await requireTenant(req);
    return handler(req, {
      organizationId: membership.organizationId,
      userId: user.id,
    }, ...args);
  };
}
