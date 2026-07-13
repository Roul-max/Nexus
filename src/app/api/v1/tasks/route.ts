import { NextRequest, NextResponse } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { organizationUsers, projects, tasks } from '@/db/schema';
import { apiHandler } from '@/lib/api-handler';
import { AuthError, requireTenant } from '@/lib/auth';
import { taskSchema } from '@/lib/validations';
import { requirePermission } from '@/lib/rbac';

const createTaskSchema = taskSchema.omit({ reporterId: true });

async function requireTenantProject(projectId: string, organizationId: string) {
  const [project] = await db.select({ id: projects.id }).from(projects).where(and(
    eq(projects.id, projectId),
    eq(projects.organizationId, organizationId),
  )).limit(1);
  if (!project) throw new AuthError('Project does not belong to this organization', 403);
}

export const GET = apiHandler(async (req: NextRequest) => {
  const { user, membership } = await requireTenant(req);
  await requirePermission(user.id, membership.organizationId, 'tasks:read');
  const projectId = z.string().uuid().parse(req.nextUrl.searchParams.get('projectId'));
  await requireTenantProject(projectId, membership.organizationId);
  const data = await db.select().from(tasks)
    .where(eq(tasks.projectId, projectId))
    .orderBy(desc(tasks.createdAt));
  return NextResponse.json({ data });
});

export const POST = apiHandler(async (req: NextRequest) => {
  const { user, membership } = await requireTenant(req);
  await requirePermission(user.id, membership.organizationId, 'tasks:write');
  const input = createTaskSchema.parse(await req.json());
  await requireTenantProject(input.projectId, membership.organizationId);
  if (input.assigneeId) {
    const [assignee] = await db.select({ id: organizationUsers.id })
      .from(organizationUsers)
      .where(and(
        eq(organizationUsers.userId, input.assigneeId),
        eq(organizationUsers.organizationId, membership.organizationId),
      ))
      .limit(1);
    if (!assignee) throw new AuthError('Assignee does not belong to this organization', 403);
  }
  const [task] = await db.insert(tasks).values({ ...input, reporterId: user.id }).returning();
  return NextResponse.json({ data: task }, { status: 201 });
});
