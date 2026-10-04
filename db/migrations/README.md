# Migration templates

There are no executable application migrations in the starter repository. The migration runner applies only files named `<number>_<lowercase_name>.sql`; it ignores the `.sql.example` file in this directory.

When an approved feature needs persistence, copy `000_template.sql.example` to the next unused migration number, replace the example with reviewed SQL, and run the migration only against a confirmed target. Once applied, a migration is immutable; add a forward repair migration instead of editing it.
