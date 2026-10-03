# Recovery planning

## Development
Development/test PostgreSQL data is local. Stop services with `docker compose stop`. Do not run `docker compose down -v` unless you deliberately intend to delete local volumes. No reset script is included. The historical catalog migration and any resulting data are retained; removing application code does not remove database objects or data.

## Application rollback
Keep the previous immutable build artifact. Before rollout, verify the older application works with the expanded schema. A code revert does not revert data or third-party effects.

## Database changes
Prefer expand → backfill/migrate → switch → contract, in separate reviewed releases. Do not edit already-applied SQL. Add a forward repair migration if needed. Test lock duration and old/new app compatibility. The included migration runner is transactional; large backfills/non-transactional operations need dedicated procedures.

## Before first production release
Record owner, deployment target, backup schedule, restore procedure, tested RPO/RTO, incident contacts, and recovery drill evidence. Template does not provision any of these. Never restore production blindly: reconcile legitimate transactions that happened after the backup.

## External side effects
Payments, emails, and machine commands may need compensating operations and reconciliation rather than rollback. Design idempotency and audit with domain owners before enabling real integrations.
