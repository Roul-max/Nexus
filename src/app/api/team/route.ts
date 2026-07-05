import { NextRequest, NextResponse } from 'next/server';
import { and, eq, gte, sql, count } from 'drizzle-orm';
import { db } from '@/db';
import { leads } from '@/db/schema';
import { apiHandler } from '@/lib/api-handler';
import { requireTenant } from '@/lib/auth';

export const dynamic = 'force-dynamic'; // Mark this route as dynamic

export const GET = apiHandler(async (req: NextRequest) => {
  const { membership } = await requireTenant(req);
  const orgId = membership.organizationId;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const leadsData = await db
    .select({
      date: sql<string>`DATE(created_at)`.as('date'),
      leadCount: count(leads.id),
    })
    .from(leads)
    .where(and(eq(leads.organizationId, orgId), gte(leads.createdAt, thirtyDaysAgo)))
    .groupBy(sql`DATE(created_at)`)
    .orderBy(sql`DATE(created_at)`);

  // Fill in missing dates with 0 leads
  const dateMap = new Map(leadsData.map(item => [item.date, item.leadCount]));
  const result = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    result.unshift({ date: dateString, leadCount: dateMap.get(dateString) ?? 0 });
  }

  return NextResponse.json({ data: result });
});