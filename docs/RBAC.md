# RBAC

Roles and permissions are strictly enforced.

## Hierarchy
1. Super Admin: `*`
2. Organization Admin: `*`
3. Manager: `read:task`, `update:task`, `create:task`
4. Employee: `read:task`

## Usage
`import { requirePermission } from '@/lib/rbac'`
`await requirePermission(userId, orgId, 'create:task')`
