import { db } from '@/db';
import { auditLogs } from '@/db/schema';
import { NextRequest } from 'next/server';

type AuditAction = 
  | 'USER_LOGIN' | 'USER_REGISTERED' | 'USER_INVITED' | 'USER_JOINED'
  | 'PROJECT_CREATED' | 'PROJECT_UPDATED' | 'PROJECT_DELETED'
  | 'TASK_CREATED' | 'TASK_COMPLETED' | 'TASK_UPDATED'
  | 'LEAD_CREATED' | 'LEAD_UPDATED' | 'LEAD_DELETED'
  | 'API_KEY_CREATED' | 'API_KEY_REVOKED';

type EntityType = 'user' | 'project' | 'task' | 'lead' | 'invitation' | 'apiKey';

export async function logAudit(
  organizationId: string,
  userId: string,
  action: AuditAction,
  entityType: EntityType,
  entityId: string,
  oldValues: Record<string, any> | null,
  newValues: Record<string, any> | null,
  req: NextRequest | Request
) {
  // Fire-and-forget to avoid blocking the main request
  void db.insert(auditLogs).values({
    organizationId, userId, action, entityType, entityId, oldValues, newValues,
    ipAddress: req.headers.get('x-forwarded-for') ?? 'unknown',
    userAgent: req.headers.get('user-agent'),
  }).catch(console.error);
}