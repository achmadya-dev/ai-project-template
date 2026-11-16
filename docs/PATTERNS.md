# Implementation patterns

Use these as shape examples, not copy-paste requirements. `docs/CODE_STANDARDS.md` is normative; this document shows the preferred implementation style for the current architecture.

For a portable Kysely example, see `src/modules/example-widget/`. Keep SQL dialect differences in provider migrations and verify query behavior against every provider the feature supports.

## Vertical slice

```text
src/modules/<domain>/
  domain/
    <entity>.ts
  <domain>.functions.ts
  repository.server.ts

src/server/
  env.server.ts
  errors.ts
  logger.server.ts
  request.ts
  request.server.ts
  portable-database.server.ts
```

Add files only when the responsibility exists. A small feature does not need every possible layer; the shared backend core already exists for cross-cutting infrastructure.

## Domain input and row schemas

Use one authoritative input schema for normalization/validation and a separate row schema for runtime validation of database output when their semantics differ.

```ts
import { z } from 'zod'

const codePattern = /^[A-Z0-9][A-Z0-9_-]*$/

export const widgetInput = z
  .object({
    code: z.string().trim().toUpperCase().min(1).max(32).regex(codePattern),
    name: z.string().trim().min(1).max(120),
  })
  .strict()

export const widgetRow = z
  .object({
    id: z.string().uuid(),
    code: z.string().min(1).max(32).regex(codePattern),
    name: z.string().min(1).max(120),
  })
  .strict()

export type WidgetInput = z.infer<typeof widgetInput>
export type Widget = z.infer<typeof widgetRow>
```

Do not add framework, database, environment, or filesystem imports to domain modules.

## Portable repository

Repository code owns domain-specific queries and maps known provider constraint failures to domain errors. Accept a typed Kysely instance in the factory for tests; compose the configured database in the server-only getter.

```ts
import type { Kysely } from 'kysely'
import { AppError } from '../../server/errors'
import { widgetRow, type Widget, type WidgetInput } from './domain/widget'

interface ExampleDatabase {
  widgets: { id: string; code: string; name: string }
}

export function createWidgetRepository(db: Kysely<ExampleDatabase>) {
  return {
    async create(input: WidgetInput): Promise<Widget> {
      const id = crypto.randomUUID()
      await db.insertInto('widgets').values({ id, ...input }).execute()
      const row = await db
        .selectFrom('widgets')
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirstOrThrow()
      const parsed = widgetRow.safeParse(row)
      if (!parsed.success) {
        throw new AppError('internal', 'DATABASE_ROW_INVALID', 'Database returned an invalid row', {
          cause: parsed.error,
          expose: false,
        })
      }
      return parsed.data
    },
  }
}
```

Do not expose Kysely's driver dialect, pool, or driver error type to callers. Catch only known constraints that have a domain meaning; rethrow unknown errors for centralized request logging.

## Environment

Application runtime code reads optional typed config through `getEnv()`:

```ts
const { databaseUrl } = getEnv()
```

Do not repeatedly access `process.env` inside repositories/server functions. Raw environment reads remain appropriate in test harnesses, scripts, build config, and process launchers.

## Request middleware and validation

Server functions use the shared middleware for request ID/timing/logging and TanStack's `.validator((input: unknown) => schema.parse(input))` for input validation. The function adapter keeps Zod failures typed as `ZodError` so the request boundary can normalize them; passing a Zod schema directly uses TanStack's Standard Schema path, which wraps validation issues in a generic `Error`. Policy checks and delegation remain explicit in the function. Because middleware factories are created at module scope in `*.functions.ts`, import them from `request.ts`; that module dynamically loads `request.server.ts` inside `.server()` so server-only logging stays out of the client graph.

```ts
import { createServerFn } from '@tanstack/react-start'
import { widgetInput } from './domain/widget'
import { getWidgetRepository } from './repository.server'
import { handleRequest, requestMiddleware } from '../../server/request'

const createRequest = requestMiddleware('widget.create')

export const createWidget = createServerFn({ method: 'POST' })
  .middleware([createRequest])
  .validator((input: unknown) => widgetInput.parse(input))
  .handler(({ data }) => handleRequest(() => getWidgetRepository().create(data)))
```

Use `handleRequest` when the UI should branch on expected exposed application failures such as conflict/forbidden without adding local `try/catch`. The validator rejects invalid parameters; request middleware normalizes Zod validation errors to the general `invalid_argument` kind. Unexpected internal failures continue to throw after centralized logging and expose only a generic error.

## Application errors

Use a general kind plus a stable specific code:

```ts
throw new AppError('not_found', 'WIDGET_NOT_FOUND', 'Widget was not found')
```

Generic kinds are:

```text
invalid_argument
not_found
conflict
unauthorized
forbidden
rate_limited
internal
```

The kind supports transport/observability behavior; the code allows domain/UI-specific handling. Do not create a class per error condition unless it adds behavior beyond kind/code/message.

## Route/UI

Routes consume server functions and map stable result codes to user-facing messages.

```tsx
const result = await createWidget({ data: values })

if (!result.ok) {
  if (result.error.code === 'DUPLICATE_CODE') {
    setMessage('This code is already in use.')
    return
  }

  setMessage('The request could not be processed.')
  return
}
```

UI may mirror constraints such as `maxLength` for usability, but server/domain validation is authoritative.

## Logging

Feature code should not repeat request timing/logging blocks. Request middleware emits structured JSON with stable safe fields such as operation, request id, duration, error kind, and error code. Do not log request bodies, tokens, connection strings, or raw PostgreSQL diagnostics.

## Testing pyramid

For one behavior, prefer the lowest-cost test that can actually prove the contract:

```text
pure normalization/config/error contract -> unit
SQL/adapter/constraint/migration race     -> integration with each supported provider
browser/server-function user flow         -> E2E
built runtime can boot safely             -> production smoke
```

A database uniqueness race cannot be proven by a mocked unit test. A pure string normalization rule does not need Playwright.

## Change workflow

For implementation tasks:

1. Read `AGENTS.md`, `docs/CODE_STANDARDS.md`, affected domain docs, and the task.
2. Inspect the closest existing implementation and tests before creating a new pattern.
3. Implement the smallest complete vertical slice.
4. Add/adjust tests at the correct layer.
5. Run the relevant checks.
6. Review the diff against the self-review checklist in `docs/CODE_STANDARDS.md`.
7. Record evidence and any intentional exception.

## Avoid these patterns

Do not introduce these by default:

```text
src/services/*       # generic service layer with no real boundary
src/utils/*          # unrelated helpers collected together
src/common/*         # vague shared dumping ground
BaseRepository       # generic CRUD inheritance
ApiResponse<T>       # wrapper without an actual protocol need
Manager/Processor    # names that hide domain responsibility
pg.Pool in features  # raw driver plumbing outside the database adapter
process.env in app   # repeated raw config reads outside env.server.ts
```

A shared abstraction is acceptable when it has a precise name and satisfies the abstraction policy in `docs/CODE_STANDARDS.md`.
