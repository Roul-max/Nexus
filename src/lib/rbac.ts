import 'server-only';
import { and, eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { roles, permissions, rolePermissions, organizationUsers } from '@/db/schema';
import { AuthError } from './auth';

type Permission = 
  | 'dashboard:read'
  | 'analytics:read'
  | 'team:read'
  | 'team:invite'
  | 'settings:write'
  | 'leads:read'
  | 'leads:write'
  | 'contacts:read'
  | 'contacts:write'
  | 'companies:read'
  | 'companies:write'
  | 'opportunities:read'
  | 'opportunities:write'
  | 'projects:read'
  | 'projects:write'
  | 'tasks:read'
  | 'tasks:write'
  | 'api_keys:manage';

const userPermissionsCache = new Map<string, Set<string>>();

export async function hasPermission(userId: string, orgId: string, permission: Permission): Promise<boolean> {
  const cacheKey = `${userId}:${orgId}`;
  if (!userPermissionsCache.has(cacheKey)) {
    const userRole = await db.query.organizationUsers.findFirst({
      where: and(eq(organizationUsers.userId, userId), eq(organizationUsers.organizationId, orgId)),
      columns: { roleId: true },
    });

    if (!userRole) return false;

    const rolePerms = await db.select({ name: permissions.name }).from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, userRole.roleId));

    userPermissionsCache.set(cacheKey, new Set(rolePerms.map(p => p.name)));
  }

  return userPermissionsCache.get(cacheKey)?.has(permission) ?? false;
}

export async function requirePermission(userId: string, orgId: string, permission: Permission): Promise<void> {
  const hasAccess = await hasPermission(userId, orgId, permission);
  if (!hasAccess) {
    throw new AuthError('Forbidden', 403);
  }
}