# Optional vertical-slice example

The files under `src/modules/example-widget/` are an inactive example, not a configured product feature. No route imports the form, no table exists by default, and no application migration is included. The example is unauthenticated and is not suitable for deployment as a protected business feature.

For a real project, define authorization and domain rules first. Create a forward-only migration for an appropriate schema and a named unique constraint; do not run example SQL against production or an unknown database. Mount `WidgetForm` from an intentionally selected route only after configuring its database and reviewing access. The server function independently validates input; client validation is only for user feedback.

The browser test creates an isolated temporary SQLite database and mounts the form in a temporary app copy, without adding a route to the starter or starting a database server. PostgreSQL and MySQL integration tests require explicitly configured disposable databases ending in `_test`; a name suffix does not prove the database is disposable.

Run `bun run test`, `bun run test:integration`, and `bun run test:example` with Playwright Chromium installed. To verify other providers, also run `bun run test:integration:postgres` and `bun run test:integration:mysql` with their respective disposable database URLs. Remove or rename the example when creating a real domain.

For the browser example against an explicitly configured disposable server database, set `EXAMPLE_TEST_PROVIDER=postgres` with `TEST_DATABASE_URL`, or `EXAMPLE_TEST_PROVIDER=mysql` with `TEST_MYSQL_URL`. Set `EXAMPLE_PRODUCTION=1` to build and run the temporary example using the Bun production runtime. These tests create and remove an `example_widgets` table and stop if it already exists; interrupted runs may leave it behind. See the README's PostgreSQL and MySQL integration and E2E section for Compose setup, commands, and test-data warnings.
