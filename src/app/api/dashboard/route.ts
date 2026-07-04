import { NextRequest, NextResponse } from 'next/server';
import { and, count, eq, sum, desc } from 'drizzle-orm';
import { db } from '@/db';
import {
  invoices,
  organizationUsers,
  projects,
  leads,
  auditLogs,
  users,
} from '@/db/schema';
import { apiHandler } from '@/lib/api-handler';
import { requireTenant } from '@/lib/auth';

export const GET = apiHandler(async (req: NextRequest) => {
  const { membership } = await requireTenant(req);
  const orgId = membership.organizationId;

  const totalRevenuePromise = db
    .select({ value: sum(invoices.amountPaid) })
    .from(invoices)
    .where(and(eq(invoices.organizationId, orgId), eq(invoices.status, 'paid')));

  const activeUsersPromise = db
    .select({ value: count() })
    .from(organizationUsers)
    .where(eq(organizationUsers.organizationId, orgId));

  const activeProjectsPromise = db
    .select({ value: count() })
    .from(projects)
    .where(and(eq(projects.organizationId, orgId), eq(projects.status, 'active')));

  const totalLeadsPromise = db
    .select({ value: count() })
    .from(leads)
    .where(eq(leads.organizationId, orgId));

  const recentActivityPromise = db
    .select({
      action: auditLogs.action,
      createdAt: auditLogs.createdAt,
      userName: users.name,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.userId, users.id))
    .where(eq(auditLogs.organizationId, orgId))
    .orderBy(desc(auditLogs.createdAt))
    .limit(5);

  const [
    [{ value: totalRevenue }],
    [{ value: activeUsers }],
    [{ value: activeProjects }],
    [{ value: totalLeads }],
    recentActivity,
  ] = await Promise.all([
    totalRevenuePromise,
    activeUsersPromise,
    activeProjectsPromise,
    totalLeadsPromise,
    recentActivityPromise,
  ]);

  const data = {
    totalRevenue: totalRevenue ?? 0,
    activeUsers: activeUsers ?? 0,
    activeProjects: activeProjects ?? 0,
    totalLeads: totalLeads ?? 0,
    recentActivity,
  };

  return NextResponse.json({ data });
});