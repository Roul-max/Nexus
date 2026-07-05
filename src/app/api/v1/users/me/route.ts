import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { organizationUsers, organizations, users, roles } from '@/db/schema';
import { AuthError, requireAuth } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const token = await requireAuth(req);
    const user = await db.query.users.findFirst({ where: eq(users.firebaseUid, token.uid) });

    if (user) {
      const now = new Date();
      // This is the logical entry point for a "login" event in this architecture.
      await db.update(users).set({ lastSignedInAt: now, lastActivityAt: now }).where(eq(users.id, user.id));
      
      // We need an organization ID to log the audit. We'll find the first one.
      const firstMembership = await db.query.organizationUsers.findFirst({
        where: eq(organizationUsers.userId, user.id),
        columns: { organizationId: true }
      });
      if (firstMembership) {
        void logAudit(firstMembership.organizationId, user.id, 'USER_LOGIN', 'user', user.id, null, null, req);
      }
    }

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const memberships = await db
      .select({
        organization: organizations,
        role: roles,
      })
      .from(organizationUsers)
      .innerJoin(organizations, eq(organizations.id, organizationUsers.organizationId))
      .innerJoin(roles, eq(roles.id, organizationUsers.roleId))
      .where(eq(organizationUsers.userId, user.id));

    return NextResponse.json({
      // Combine organization and role info for the frontend
      data: { ...user, organizations: memberships.map(({ organization, role }) => ({ ...organization, role: role.name })) },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Fetch current user failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
