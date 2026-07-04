import { db } from '@/db';
import { organizationUsers, roles, rolePermissions, permissions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { AuthError } from '@/lib/auth';

export type Permission = 
  | 'projects:create' | 'projects:view'
  | 'tasks:create' | 'tasks:view'
  | 'leads:create' | 'leads:view'
  | 'api_keys:manage';

export async function hasPermission(userId: string, organizationId: string, requiredPermission: Permission): Promise<boolean> {
  // Query user role in organization
  const orgUser = await db.select({
    roleId: organizationUsers.roleId
  })
  .from(organizationUsers)
  .where(
    and(
      eq(organizationUsers.userId, userId),
      eq(organizationUsers.organizationId, organizationId)
    )
  )
  .limit(1);

  if (orgUser.length === 0) return false;

  const roleId = orgUser[0].roleId;

  // Query permissions for this role
  const rolePerms = await db.select({
    permissionName: permissions.name
  })
  .from(rolePermissions)
  .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
  .where(eq(rolePermissions.roleId, roleId));

  const permSet = rolePerms.map(rp => rp.permissionName);

  return permSet.includes(requiredPermission) || permSet.includes('*');
}

export async function requirePermission(userId: string, organizationId: string, requiredPermission: Permission) {
  const allowed = await hasPermission(userId, organizationId, requiredPermission);
  if (!allowed) {
    throw new AuthError(`Forbidden: Requires ${requiredPermission} permission`, 403);
  }
}
