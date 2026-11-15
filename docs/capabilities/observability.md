# Observability

The starter already has structured JSON logging in `src/server/logger.server.ts` and request IDs, timing, and error normalization in `src/server/request.server.ts`. It does not include a hosted sink, metrics backend, tracing provider, or alerting.

Before adding them, define operational questions, service ownership, access, retention, data classification, sampling, costs, and alert response. Correlate requests across boundaries only after defining trust for incoming identifiers; do not log payloads, tokens, credentials, personal data, or raw database diagnostics. A vendor or OpenTelemetry dependency needs a concrete requirement and review.

Test that expected events contain safe fields, unexpected errors are normalized, sensitive inputs are absent, and sink failure does not leak details. Test propagation and sampling if tracing is added. Verify dashboards and alerts against synthetic events in an authorized non-production environment.
