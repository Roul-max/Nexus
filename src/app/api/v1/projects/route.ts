import { NextRequest, NextResponse } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { projects, teams } from '@/db/schema';
import { apiHandler } from '@/lib/api-handler';
import { AuthError, requireTenant } from '@/lib/auth';
import { projectSchema } from '@/lib/validations';
import { requirePermission } from '@/lib/rbac';

const createProjectSchema = projectSchema.omit({ organizationId: true });

export const GET = apiHandler(async (req: NextRequest) => {
  const { user, membership } = await requireTenant(req);
  await requirePermission(user.id, membership.organizationId, 'projects:read');
  const data = await db.select().from(projects)
    .where(eq(projects.organizationId, membership.organizationId))
    .orderBy(desc(projects.createdAt));
  return NextResponse.json({ data });
});

export const POST = apiHandler(async (req: NextRequest) => {
  const { user, membership } = await requireTenant(req);
  await requirePermission(user.id, membership.organizationId, 'projects:write');
  const input = createProjectSchema.parse(await req.json());
  if (input.teamId) {
    const [team] = await db.select({ id: teams.id }).from(teams).where(and(
      eq(teams.id, input.teamId),
      eq(teams.organizationId, membership.organizationId),
    )).limit(1);
    if (!team) throw new AuthError('Team does not belong to this organization', 403);
  }
  const [project] = await db.insert(projects).values({
    ...input,
    organizationId: membership.organizationId,
  }).returning();
  return NextResponse.json({ data: project }, { status: 201 });
});
