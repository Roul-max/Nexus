INSERT INTO "permissions" ("name", "description") VALUES
  ('projects:create', 'Create projects'),
  ('projects:view', 'View projects'),
  ('tasks:create', 'Create tasks'),
  ('tasks:view', 'View tasks'),
  ('leads:create', 'Create leads'),
  ('leads:view', 'View leads'),
  ('api_keys:manage', 'Manage organization API keys')
ON CONFLICT ("name") DO NOTHING;
--> statement-breakpoint
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT r."id", p."id"
FROM "roles" r
CROSS JOIN "permissions" p
WHERE r."name" = 'Organization Admin'
  AND p."name" IN (
    'projects:create',
    'projects:view',
    'tasks:create',
    'tasks:view',
    'leads:create',
    'leads:view',
    'api_keys:manage'
  )
ON CONFLICT ("role_id", "permission_id") DO NOTHING;
