# Kysely as the application persistence adapter

Status: accepted
Date: 2026-11-16
Task/issue: https://github.com/achmadya-dev/ai-project-template/issues/55

## Context

The application had two database access patterns: a PostgreSQL-only `DatabaseClient`/`getDb()` adapter and a portable Kysely adapter for SQLite, PostgreSQL, and MySQL. No active feature used the PostgreSQL-only adapter. Keeping both patterns made the starter's persistence interface unclear and required duplicate tests and guidance.

## Decision

Use the typed Kysely adapter in `src/server/portable-database.server.ts` as the single application persistence seam for all supported providers. Feature repositories accept typed Kysely instances and validate rows before returning them. Provider-specific driver construction stays in the shared adapter, and provider-specific SQL migrations remain separate.

The PostgreSQL migration runner continues to use the `pg` driver directly as command-line infrastructure; it is not an application persistence pattern.

## Consequences

- New application features use the same repository shape regardless of provider.
- The unused `DatabaseClient` and `getDb()` adapters and their adapter-specific test contract are removed.
- Existing consumers that imported those internal modules must move to the Kysely adapter. They were not public package APIs.
- Kysely does not guarantee identical provider behavior. Provider integration tests remain necessary for constraints, transactions, and migration behavior.
- This decision supersedes ADR 0001's temporary PostgreSQL adapter compatibility choice.

## Alternatives considered

- Keep both adapters and label the PostgreSQL path as legacy: rejected because no active feature needs the separate interface.
- Replace Kysely with raw SQL adapters per provider: rejected because it would multiply application persistence interfaces and repeat plumbing.
