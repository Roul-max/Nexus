# Observability

## OpenTelemetry
The platform leverages OpenTelemetry to export traces and metrics.
- `src/lib/telemetry/index.ts` initializes the SDK.
- Traces are exported via OTLP HTTP to a configured collector (e.g., Jaeger/DataDog).
- Metrics are tracked via `prom-client` on `/api/metrics`.

## Logging
Audit logs are stored directly in PostgreSQL via the `auditLogs` table, tracking `action`, `entityType`, `oldValues`, and `newValues`.
