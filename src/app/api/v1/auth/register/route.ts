import { NextRequest, NextResponse } from 'next/server';
import { eq, or } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { organizationUsers, organizations, roles, users } from '@/db/schema';
import { AuthError, requireAuth } from '@/lib/auth';

const bodySchema = z.object({ name: z.string().trim().min(1).max(255).optional() });

export async function POST(req: NextRequest) {
  try {
    const token = await requireAuth(req);
    if (!token.email) return NextResponse.json({ error: 'Firebase account has no email' }, { status: 400 });
    const body = bodySchema.parse(await req.json().catch(() => ({})));
    const existing = await db.query.users.findFirst({
      where: or(eq(users.firebaseUid, token.uid), eq(users.email, token.email)),
    });
    if (existing?.firebaseUid === token.uid) {
      return NextResponse.json({ message: 'User already exists', user: existing });
    }
    if (existing) {
      return NextResponse.json({ error: 'Email is already linked to another account' }, { status: 409 });
    }

    const result = await db.transaction(async (tx) => {
      const [user] = await tx.insert(users).values({
        firebaseUid: token.uid,
        email: token.email!,
        name: token.name ?? body.name ?? null,
      }).returning();

      const [organization] = await tx.insert(organizations).values({
        name: `${user.name || 'User'}'s Organization`,
        slug: `org-${token.uid.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
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
