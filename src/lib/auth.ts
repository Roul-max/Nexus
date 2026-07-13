import 'server-only';

import type { NextRequest } from 'next/server';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { organizationUsers, organizations, users, roles } from '@/db/schema';
import { adminAuth } from '@/lib/firebase/server';
import { logAudit } from './audit';

export class AuthError extends Error {
  constructor(message = 'Unauthorized', public readonly status = 401) {
    super(message);
  }
}

export async function requireAuth(req: NextRequest | Request): Promise<DecodedIdToken> {
  const header = req.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) throw new AuthError();
  const token = header.slice(7).trim();
  if (!token) throw new AuthError();

  try {
    return await adminAuth.verifyIdToken(token);
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    throw new AuthError('Invalid token');
  }
}

export async function requireTenant(req: NextRequest | Request) {
  const token = await requireAuth(req);
  const user = await db.query.users.findFirst({ 
    where: eq(users.firebaseUid, token.uid),
  });
  if (!user || !user.isActive) throw new AuthError('User not found or inactive', 403);

  // Update last activity on tenant-aware requests.
  // This is a non-blocking operation, but we should still handle potential errors.
  (async () => {
    try {
      await db.update(users).set({ lastActivityAt: new Date() }).where(eq(users.id, user.id));
    } catch (error) {
      console.error(`Failed to update last activity for user ${user.id}:`, error);
    }
  })();

  const orgId = req.headers.get('x-organization-id');
  if (!orgId) throw new AuthError('Missing organization context', 400);

  const [membership] = await db
    .select({ membership: organizationUsers, organization: organizations, role: roles })
    .from(organizationUsers)
    .innerJoin(organizations, eq(organizations.id, organizationUsers.organizationId))
    .innerJoin(roles, eq(roles.id, organizationUsers.roleId))
    .where(
      and(eq(organizationUsers.userId, user.id), eq(organizationUsers.organizationId, orgId))
    )
    .limit(1);

  if (!membership) throw new AuthError('Organization membership required', 403);
  return { token, user, ...membership };
}