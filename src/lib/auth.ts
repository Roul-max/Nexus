import 'server-only';

import type { NextRequest } from 'next/server';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { organizationUsers, organizations, users } from '@/db/schema';
import { adminAuth } from '@/lib/firebase/server';

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
    return await adminAuth.verifyIdToken(token, true);
  } catch {
    throw new AuthError('Invalid or expired token');
  }
}

export async function requireTenant(req: NextRequest | Request) {
  const token = await requireAuth(req);
  const user = await db.query.users.findFirst({
    where: eq(users.firebaseUid, token.uid),
  });
  if (!user || !user.isActive) throw new AuthError('User not found or inactive', 403);

  const requestedOrganizationId = req.headers.get('x-organization-id');
  const memberships = await db
    .select({ membership: organizationUsers, organization: organizations })
    .from(organizationUsers)
    .innerJoin(organizations, eq(organizations.id, organizationUsers.organizationId))
    .where(
      requestedOrganizationId
        ? and(
            eq(organizationUsers.userId, user.id),
            eq(organizationUsers.organizationId, requestedOrganizationId),
          )
        : eq(organizationUsers.userId, user.id),
    )
    .limit(1);

  if (!memberships[0]) throw new AuthError('Organization membership required', 403);
  return { token, user, ...memberships[0] };
}
