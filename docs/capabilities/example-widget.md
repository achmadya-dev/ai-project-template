# Optional vertical-slice example

The files under `src/modules/example-widget/` are an inactive example, not a configured product feature. No route imports the form, no table exists by default, and no application migration is included. The example is unauthenticated and is not suitable for deployment as a protected business feature.

For a real project, define authorization and domain rules first. Create a forward-only migration for an appropriate schema and a named unique constraint; do not run example SQL against production or an unknown database. Mount `WidgetForm` from an intentionally selected route only after configuring its database and reviewing access. The server function independently validates input; client validation is only for user feedback.

The repository integration test uses a temporary table. The browser test creates and removes its own `example_widgets` table and refuses to start if a table with that name already exists. Both require a verified disposable `TEST_DATABASE_URL` ending in `_test`; a name suffix does not prove the database is disposable. The browser test copies the app to a temporary directory and mounts the form there, without adding a route to the starter.

Run `bun run test`, `bun run test:integration`, and `bun run test:example` with the disposable test database and Playwright Chromium installed. Remove or rename the example when creating a real domain.
