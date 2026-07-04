# API Reference

## Endpoints
- `GET /api/v1/health` - Check system readiness.
- `GET /api/v1/api-keys` - List API keys.
- `POST /api/v1/api-keys` - Generate a new API key.
- `POST /api/v1/files/upload` - Generate S3 pre-signed upload URL.
- `POST /api/webhooks/stripe` - Receive Stripe billing events.

## Authentication
API requests must include the `Authorization` header:
`Authorization: Bearer nx_...`
