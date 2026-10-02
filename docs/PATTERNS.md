# Implementation patterns

Use these as shape examples, not copy-paste requirements. `docs/CODE_STANDARDS.md` is normative; this document shows the preferred implementation style for the current architecture.

## Vertical slice

```text
src/modules/<domain>/
  domain/
    <entity>.ts
  <domain>.functions.ts
  repository.server.ts

tests/
  unit/
  integration/
  e2e/
```

Add files only when the responsibility exists. A small feature does not need every possible layer.

## Domain schema and result type

Prefer one authoritative schema that normalizes and validates server input, plus explicit result unions for expected business outcomes.

```ts
import { z } from 'zod'

export const widgetInput = z.object({
  code: z.string().trim().toUpperCase().min(1).max(32),
  name: z.string().trim().min(1).max(120),
}).strict()

export type WidgetInput = z.infer<typeof widgetInput>
export type Widget = { id: string; code: string; name: string }
export type CreateWidgetResult =
  | { ok: true; widget: Widget }
  | { ok: false; code: 'DUPLICATE_CODE' }
```

Do not add framework, database, environment, or filesystem imports to domain modules.

## Repository

Repository functions own SQL and translate known persistence failures into domain outcomes. Pass database dependencies explicitly.

```ts
import type { Pool } from 'pg'
import { widgetInput, type CreateWidgetResult, type Widget } from './domain/widget'

export async function insertWidget(db: Pool, input: unknown): Promise<CreateWidgetResult> {
  const data = widgetInput.parse(input)

  try {
    const result = await db.query<Widget>(
      'INSERT INTO widgets (code, name) VALUES ($1, $2) RETURNING id, code, name',
      [data.code, data.name],
    )

    const widget = result.rows[0]
    if (!widget) throw new Error('Insert did not return a widget')
    return { ok: true, widget }
  } catch (error) {
    if (isKnownDuplicateConstraint(error)) return { ok: false, code: 'DUPLICATE_CODE' }
    throw error
  }
}
```

Keep constraint matching narrow. Never convert every database failure into a business duplicate/not-found response.

## Server function

Server functions are thin boundaries: validate, authorize/policy-check, obtain server dependencies, delegate.

```ts
import { createServerFn } from '@tanstack/react-start'
import { widgetInput } from './domain/widget'
import { getDb } from '../../server/db.server'
import { insertWidget } from './repository.server'

export const createWidget = createServerFn({ method: 'POST' })
  .validator(widgetInput)
  .handler(async ({ data }) => {
    // authorization/policy checks happen here before mutation
    return insertWidget(getDb(), data)
  })
```

Do not put SQL or a second copy of domain validation/business rules in this layer.

## Route/UI

Route modules consume server functions and map stable result codes to user-facing messages.

```tsx
const result = await createWidget({ data: values })
if (!result.ok) {
  if (result.code === 'DUPLICATE_CODE') {
    setMessage('Kode sudah digunakan.')
    return
  }
}
```

UI may mirror constraints such as `maxLength` for usability, but server/domain validation is authoritative.

## Testing pyramid

For one behavior, prefer the lowest-cost test that can actually prove the contract:

```text
pure normalization/invariant       -> unit
SQL constraint/query/migration     -> integration with real PostgreSQL
browser/server-function user flow  -> E2E
built runtime can boot safely      -> production smoke
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
```

A shared abstraction is acceptable when it has a precise name and satisfies the abstraction policy in `docs/CODE_STANDARDS.md`.
