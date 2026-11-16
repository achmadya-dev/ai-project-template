# Migration guidance

The starter includes executable auth migrations for each supported provider in its own subdirectory. Every provider uses the same migration filenames and numbering, with one SQL statement per file. Use the `<number>_<action>_<object>.sql` pattern (for example, `010_create_example_records_table.sql`) so a filename describes its operation and target. The SQL remains provider-specific because types and syntax differ. The migration runner applies only files named `<number>_<lowercase_name>.sql` inside the selected provider directory; it ignores the `000_template.sql.example` file at the root of `db/migrations/`. Migrations are **never applied automatically at application startup**.

Runner implementations are grouped in `scripts/migrations/`: `shared.mjs` loads and checks migration history, while `sqlite.mjs`, `postgres.mjs`, and `mysql.mjs` own provider-specific locking and transaction behavior. `scripts/migrate.mjs` is the CLI entry point; tests and other callers import provider runners directly.

| Provider | Migration location | Recovery consideration |
| --- | --- | --- |
| SQLite (default) | `db/migrations/sqlite/` | Transactional runner |
| PostgreSQL | `db/migrations/postgres/` | Transactional runner; `CREATE INDEX CONCURRENTLY` is not supported |
| MySQL | `db/migrations/mysql/` | One statement per file; DDL can commit independently and an incomplete attempt requires manual inspection |

When an approved feature needs persistence, create the same numbered migration filename in every provider directory it supports, using one statement per file. `000_template.sql.example` illustrates the dialect format for SQLite, PostgreSQL, and MySQL; do not assume SQL is portable across engines without testing. Review the actual schema and migration history, confirm the target, and run `bun run db:migrate` explicitly. Never run against an unknown target. Once applied, a migration is immutable; add a forward repair migration instead of editing it.

The bundled auth migrations target a new template database. Before using them in an existing project, review migration numbering, existing auth tables, compatibility, and backups. See [recovery planning](../../docs/runbooks/RECOVERY.md); reverting code does not undo database changes.
