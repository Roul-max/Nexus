import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { organizationUsers, organizations, users } from '@/db/schema';
import { AuthError, requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = await requireAuth(req);
    const user = await db.query.users.findFirst({ where: eq(users.firebaseUid, token.uid) });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const memberships = await db
      .select({ organization: organizations })
      .from(organizationUsers)
      .innerJoin(organizations, eq(organizations.id, organizationUsers.organizationId))
      .where(eq(organizationUsers.userId, user.id));

    return NextResponse.json({
      data: { ...user, organizations: memberships.map(({ organization }) => organization) },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Fetch current user failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
