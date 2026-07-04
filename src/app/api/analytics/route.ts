import { NextRequest, NextResponse } from 'next/server';
import { and, count, eq, gte, sum } from 'drizzle-orm';
import { db } from '@/db';
import {
  invoices,
  organizationUsers,
  projects,
  leads,
  tasks,
} from '@/db/schema';
import { apiHandler } from '@/lib/api-handler';
import { requireTenant } from '@/lib/auth';

export const GET = apiHandler(async (req: NextRequest) => {
  const { membership } = await requireTenant(req);
  const orgId = membership.organizationId;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const leadsPromise = db
    .select({ value: count() })
    .from(leads)
    .where(and(eq(leads.organizationId, orgId), gte(leads.createdAt, thirtyDaysAgo)));

  const projectsPromise = db
    .select({ value: count() })
    .from(projects)
    .where(and(eq(projects.organizationId, orgId), gte(projects.createdAt, thirtyDaysAgo)));

  const tasksPromise = db
    .select({ value: count() })
    .from(tasks)
    .where(and(
      eq(tasks.status, 'done'),
      gte(tasks.updatedAt, thirtyDaysAgo),
      // This requires a join to filter by organization
      eq(projects.organizationId, orgId)
    ))
    .innerJoin(projects, eq(tasks.projectId, projects.id));

  const revenuePromise = db
    .select({ value: sum(invoices.amountPaid) })
    .from(invoices)
    .where(and(eq(invoices.organizationId, orgId), eq(invoices.status, 'paid'), gte(invoices.createdAt, thirtyDaysAgo)));

  const usersPromise = db
    .select({ value: count() })
    .from(organizationUsers)
    .where(eq(organizationUsers.organizationId, orgId));

  const [
    [{ value: leadsLast30Days }],
    [{ value: projectsLast30Days }],
    [{ value: tasksLast30Days }],
    [{ value: revenueLast30Days }],
    [{ value: totalUsers }],
  ] = await Promise.all([leadsPromise, projectsPromise, tasksPromise, revenuePromise, usersPromise]);

  const data = {
    leadsLast30Days: leadsLast30Days ?? 0,
    projectsLast30Days: projectsLast30Days ?? 0,
    tasksLast30Days: tasksLast30Days ?? 0,
    revenueLast30Days: revenueLast30Days ?? 0,
    totalUsers: totalUsers ?? 0,
  };

  return NextResponse.json({ data });
});