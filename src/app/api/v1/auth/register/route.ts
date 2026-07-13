import { NextRequest, NextResponse } from 'next/server';
import { eq, or } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { organizationUsers, organizations, roles, users } from '@/db/schema';
import { AuthError } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

const bodySchema = z.object({ name: z.string().trim().min(1).max(255).optional() });

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    const userEmail = req.headers.get('x-user-email');

    if (!userId || !userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = bodySchema.parse(await req.json().catch(() => ({})));
    const existing = await db.query.users.findFirst({
      where: or(eq(users.firebaseUid, userId), eq(users.email, userEmail)),
    });
    if (existing?.firebaseUid === userId) {
      return NextResponse.json({ message: 'User already exists', user: existing });
    }
    if (existing) {
      return NextResponse.json({ error: 'Email is already linked to another account' }, { status: 409 });
    }

    const result = await db.transaction(async (tx) => {
      const [user] = await tx.insert(users).values({
        firebaseUid: userId,
        email: userEmail,
        name: body.name ?? null,
        lastSignedInAt: new Date(),
        lastActivityAt: new Date(),
      }).returning();

      const [organization] = await tx.insert(organizations).values({
        name: `${user.name || 'User'}'s Organization`,
        slug: `org-${userId.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      }).returning();

      let role = await tx.query.roles.findFirst({ where: eq(roles.name, 'Organization Admin') });
      if (!role) {
        [role] = await tx.insert(roles).values({
          name: 'Organization Admin',
          description: 'Full administrative access',
        }).returning();
      }
      await tx.insert(organizationUsers).values({
        organizationId: organization.id,
        userId: user.id,
        roleId: role.id,
      });

      await logAudit(
        organization.id,
        user.id,
        'USER_REGISTERED',
        'user',
        user.id,
        null,
        { email: user.email, name: user.name },
        req
      );
      return user;
    });

    return NextResponse.json({ message: 'User created successfully', user: result }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (error instanceof z.ZodError) return NextResponse.json({ error: 'Invalid request', details: error.flatten() }, { status: 400 });
    console.error('Registration failed:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
