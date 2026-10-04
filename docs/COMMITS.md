# Commit message convention

Use **Conventional Commits**, with an optional scope:

```text
<type>(<scope>): <description>

[optional body]

[optional footer]
```

## Main rules

- Use lowercase `type` and `scope`.
- Write a short, specific description in the imperative mood, without a final period.
- Each commit represents one logical change. Do not mix unrelated refactoring, features, and cleanup.
- Add a body only when the subject does not explain the context, reason, trade-off, or impact.
- Never include sensitive information, credentials, secrets, customer data, or private debug output.
- Reference an issue when relevant, for example `Refs #123` or `Closes #123` in a footer.
- Mark breaking changes with `!` after the type/scope or with a `BREAKING CHANGE:` footer.

## Allowed types

| Type | Use for |
| --- | --- |
| `feat` | New behavior visible to a user or caller |
| `fix` | A bug or incorrect behavior |
| `refactor` | Internal structure changes without intended behavior changes |
| `perf` | Performance improvement |
| `test` | Tests added or changed without production behavior changes |
| `docs` | Documentation only |
| `build` | Build system, dependencies, package manager, or bundling |
| `ci` | CI/CD workflow or repository automation |
| `chore` | Maintenance that does not fit another type |
| `revert` | Reverting a previous commit |

Do not use `feat` for every change. Use a more specific type for documentation, tests, tooling, and internal changes.

## Scope and subject

Scope is optional and should describe the area changed, not a person's name or task number. If a change spans several areas without one clear primary scope, omit the scope instead of using a generic value such as `app` or `misc`.

The subject should describe the result, not the act of working on it. Keep it specific, ideally 72 characters or fewer, and omit an issue number when it can go in a footer.

```text
feat(auth): add password reset flow
fix(api): reject malformed pagination cursor
refactor(domain): extract order pricing policy
test(checkout): cover declined payment path
docs(workflow): clarify release evidence
ci(github): verify pull request metadata
```

Avoid vague subjects such as `fix: update code`, `chore: changes`, or `feat: work on auth`.

## Body and breaking changes

Use a body when a commit needs more context. Focus on why the change exists and its impact instead of repeating the diff.

```text
fix(checkout): prevent duplicate payment submission

Disable the submit path after the first accepted request so retries from
rapid clicks cannot create multiple payment intents.

Refs #214
```

Mark a breaking change with either `feat(api)!: replace cursor pagination contract` or a `BREAKING CHANGE:` footer. Explain its migration or compatibility impact in the pull request when relevant.

## Reverts

Use `revert: <original commit subject>`. The body should name the reverted commit and explain why it was reverted.

## Commits created by AI agents

AI agents follow the same rules as people. Do not commit unverified changes, claim a test passed unless it was run, or include prompts, chain-of-thought, secrets, or user conversations in a commit message. Split independent work into logically scoped commits when useful. Do not rewrite user-owned history, squash, force-push, or amend a user's commit unless explicitly asked.

Commit messages are read during review, debugging, release notes, and rollback. Prefer a clear description of the change over formal wording.
