# Migration guidance

The starter includes executable auth migrations for each supported provider. The migration runner applies only files named `<number>_<lowercase_name>.sql`; it ignores the `.sql.example` template in this directory. Migrations are **never applied automatically at application startup**.

| Provider | Migration location | Recovery consideration |
| --- | --- | --- |
| PostgreSQL | `db/migrations/` | Transactional runner; `CREATE INDEX CONCURRENTLY` is not supported |
| SQLite | `db/migrations/sqlite/` | Transactional runner |
| MySQL | `db/migrations/mysql/` | DDL can commit independently; an incomplete attempt requires manual inspection |

When an approved feature needs persistence, create the next unused migration for each provider it supports. `000_template.sql.example` illustrates the PostgreSQL format; do not assume its SQL is portable. Review the actual schema and migration history, confirm the target, and run `bun run db:migrate` explicitly. Never run against an unknown target. Once applied, a migration is immutable; add a forward repair migration instead of editing it.

The bundled auth migrations target a new template database. Before using them in an existing project, review migration numbering, existing auth tables, compatibility, and backups. See [recovery planning](../../docs/runbooks/RECOVERY.md); reverting code does not undo database changes.
