import { db } from '@/db';
import { auditLogs } from '@/db/schema';
import { NextRequest } from 'next/server';

export async function logAudit(
  organizationId: string,
  userId: string | null,
  action: string,
  entityType: string,
  entityId: string,
  oldValues: Record<string, unknown> | null = null,
  newValues: Record<string, unknown> | null = null,
  req?: NextRequest
) {
  try {
    const ipAddress = req?.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req?.headers.get('user-agent') || 'unknown';

    await db.insert(auditLogs).values({
      organizationId,
      userId,
      action,
      entityType,
      entityId,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}
