# SQLite default and portable SQL

Status: proposed

## Context

The PostgreSQL-only adapter and migration runner require a database server for integration and example browser tests. The template needs a local SQLite default and explicit PostgreSQL/MySQL choices without claiming that switching a provider moves existing data.

## Decision

Use Kysely as a typed SQL query builder for new portable repositories, with `better-sqlite3`, `pg`, and `mysql2` server-only drivers. SQLite's driver works in both Bun and the existing Node-based Vitest harness. Runtime row validation remains necessary. The existing PostgreSQL adapter, its migration directory, and its `schema_migrations` history remain intact for compatibility; existing PostgreSQL-specific repositories do not become portable automatically.

Keep versioned SQL migration files per provider. SQLite uses an immediate transaction and checksum validation; the existing PostgreSQL runner is unchanged in its behavior. MySQL uses a named lock, checksum history, and a durable attempt marker because MySQL DDL may implicitly commit. A failed or interrupted MySQL migration requires manual inspection. No provider migrates automatically at startup. The application has no active business migration by default.

## Alternatives and consequences

Manual SQL per engine increases dialect-specific work and error handling. A schema-generating ORM can simplify authoring but still needs provider-specific migration and behavior verification. Kysely is close to the existing SQL style, but query-builder typing does not ensure equivalent behavior across databases; every supported provider requires real integration tests. SQLite requires persistent storage, and switching providers requires a separately planned and verified data transfer.

New dependencies, native SQLite installation, CI changes, deployment TLS, locking, and MySQL recovery increase operational complexity. Reverting application code does not revert migrations or move data. Production changes need backups and explicit authorization.
