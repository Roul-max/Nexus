# Multi-Tenant Architecture

Nexus utilizes a shared-database, isolated-schema (logically) approach.
Every table related to user data MUST contain `organizationId`.

## Enforcement
Data queries MUST always include `.where(eq(table.organizationId, orgId))` to prevent cross-tenant data spillage.
Tenant middleware injects the `x-organization-id` header into the request context.
