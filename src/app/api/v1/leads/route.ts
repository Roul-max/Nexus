import { NextRequest, NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { leads } from '@/db/schema';
import { apiHandler } from '@/lib/api-handler';
import { requireTenant } from '@/lib/auth';
import { leadSchema } from '@/lib/validations';
import { requirePermission } from '@/lib/rbac';

const createLeadSchema = leadSchema.omit({ organizationId: true });

export const GET = apiHandler(async (req: NextRequest) => {
  const { user, membership } = await requireTenant(req);
  await requirePermission(user.id, membership.organizationId, 'leads:view');
  const data = await db.select().from(leads)
    .where(eq(leads.organizationId, membership.organizationId))
    .orderBy(desc(leads.createdAt));
  return NextResponse.json({ data });
});

export const POST = apiHandler(async (req: NextRequest) => {
  const { user, membership } = await requireTenant(req);
  await requirePermission(user.id, membership.organizationId, 'leads:create');
  const input = createLeadSchema.parse(await req.json());
  const [lead] = await db.insert(leads).values({
    ...input,
    organizationId: membership.organizationId,
  }).returning();
  return NextResponse.json({ data: lead }, { status: 201 });
});
