# Recovery planning

## Development

Development PostgreSQL data is local. Stop services with `docker compose stop`. Do not run `docker compose down -v` unless you intend to delete local volumes. The test PostgreSQL service uses `tmpfs` and is disposable. The template has no application schema until a project adds and applies a migration.

## Application rollback

Keep the previous immutable build artifact. Before a rollout, verify that the older application still works with the expanded schema. Reverting code does not roll back data or third-party effects.

## Database changes

Prefer expand → backfill/migrate → switch → contract across separately reviewed releases. Do not edit an applied SQL migration. Add a forward repair migration when needed. Test lock duration and compatibility with both old and new application versions. The included migration runner uses transactions; large backfills and non-transactional work require dedicated procedures.

## Before the first production release

Record the owner, deployment target, backup schedule, restore procedure, tested RPO/RTO, incident contacts, and recovery-drill evidence. The template does not provision these. Never restore production blindly; reconcile legitimate transactions that occurred after the backup.

## External side effects

Payments, emails, and machine commands may require compensating actions and reconciliation instead of rollback. Work with domain owners to design idempotency and audit before enabling real integrations.
