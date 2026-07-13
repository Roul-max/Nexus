import { NextRequest, NextResponse } from 'next/server';
import { and, count, eq, gte, sum, desc } from 'drizzle-orm';
import { hasPermission } from '@/lib/rbac';
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
import { AuthError, requireTenant } from '@/lib/auth';

export const GET = apiHandler(async (req: NextRequest) => {
  const { membership, user } = await requireTenant(req);
  const orgId = membership.organizationId;

  const canReadDashboard = await hasPermission(user.id, orgId, 'dashboard:read');
  if (!canReadDashboard) throw new AuthError('Forbidden');

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

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

  const newLeadsPromise = db
    .select({ value: count() })
    .from(leads)
    .where(and(eq(leads.organizationId, orgId), gte(leads.createdAt, sevenDaysAgo)));

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
    [{ value: newLeadsLast7Days }],
    recentActivity,
  ] = await Promise.all([
    totalRevenuePromise,
    activeUsersPromise,
    activeProjectsPromise,
    newLeadsPromise,
    recentActivityPromise,
  ]);

  const data = {
    totalRevenue: totalRevenue ?? 0,
    activeUsers: activeUsers ?? 0,
    activeProjects: activeProjects ?? 0,
    newLeadsLast7Days: newLeadsLast7Days ?? 0,
    recentActivity: recentActivity.map(a => ({ ...a, createdAt: a.createdAt.toISOString() })),
  };

  return NextResponse.json({
    data,
  });
});