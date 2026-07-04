import { NextRequest, NextResponse } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';
import { formatDistanceToNow } from 'date-fns';
import { db } from '@/db';
import { organizationUsers, users, roles } from '@/db/schema';
import { apiHandler } from '@/lib/api-handler';
import { updateUserActivity } from '@/lib/activity';
import { requireTenant } from '@/lib/auth';

export const GET = apiHandler(async (req: NextRequest) => {
  const { user, membership } = await requireTenant(req);
  const orgId = membership.organizationId;

  // Fire-and-forget activity update
  updateUserActivity(user.id);

  const members = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatarUrl: users.avatarUrl,
      role: roles.name,
      lastActivityAt: users.lastActivityAt,
      createdAt: organizationUsers.createdAt,
    })
    .from(organizationUsers)
    .innerJoin(users, eq(organizationUsers.userId, users.id))
    .innerJoin(roles, eq(organizationUsers.roleId, roles.id))
    .where(eq(organizationUsers.organizationId, orgId))
    .orderBy(desc(users.lastActivityAt));

  const data = members.map(member => {
    const lastActive = member.lastActivityAt
      ? formatDistanceToNow(member.lastActivityAt, { addSuffix: true })
      : 'Never';
    const isActive =
      member.lastActivityAt &&
      new Date().getTime() - new Date(member.lastActivityAt).getTime() < 5 * 60 * 1000;

    return { ...member, lastActive, status: isActive ? 'Active' : 'Offline' };
  });

  return NextResponse.json({ data });
});