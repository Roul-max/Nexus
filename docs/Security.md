# Security

## Features
1. **CSRF Protection**: All mutating API endpoints require a valid CSRF token, validated via edge middleware.
2. **Helmet Headers**: Standard security headers (HSTS, NoSniff, X-Frame-Options) applied globally.
3. **Rate Limiting**: Sliding window rate limiting via Redis (100 reqs/10s per IP).
4. **Tenant Isolation**: All queries enforce strict `organizationId` boundaries.
5. **API Keys**: Bearer token authentication for machine-to-machine interaction.
6. **SQL Injection Protection**: Drizzle ORM uses parameterized queries.
