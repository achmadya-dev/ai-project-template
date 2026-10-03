# Use canonical Tailwind max-width utilities

Status: in-review
Risk: high
Issue: https://github.com/achmadya-dev/ai-project-template/issues/26
PR: pending
Plan revision: 1
Authorization: user requested removal of the displayed Tailwind warnings and explicitly requested opening a PR and merging it.

## Goal
Remove Tailwind IntelliSense canonical-class warnings without changing the rendered layout.

## Scope
Replace arbitrary pixel max-width utilities in the root and home routes with the exact canonical utilities suggested by Tailwind, and establish a rule so future AI-authored Tailwind classes prefer canonical equivalents. No design changes, dependency changes, or lint-config changes.

## Acceptance criteria
- [x] AC-1: No `max-w-[1120px]`, `max-w-[750px]`, or `max-w-[570px]` remains; their canonical equivalents preserve the same widths.
- [x] AC-2: Formatting, lint, build, and typecheck pass.
- [x] AC-3: `AGENTS.md` and `docs/CODE_STANDARDS.md` instruct agents to prefer exact canonical Tailwind utilities and resolve canonical-class warnings.

## Domain invariants
Not applicable; this is a styling-only change. Preserve existing pixel widths and responsive behavior.

## Plan
1. Replace the three arbitrary max-width forms in `src/routes/__root.tsx` and `src/routes/index.tsx` with Tailwind's suggested canonical forms.
2. Add canonical-class guidance to the central AI agreement and normative code standards.
3. Run repository checks and inspect the diff.

## Verification plan
- AC-1: Search the two route files for the old arbitrary classes and verify only the canonical equivalents remain.
- AC-2: Run `bun run check`.
- AC-3: Review the AI agreement and code standards wording.

## Compatibility and recovery
No runtime/domain/API/database impact. Revert the PR to restore the original class spellings and guidance if needed.

## Decisions and questions
Use the exact canonical classes reported by Tailwind IntelliSense: `max-w-280`, `max-w-187.5`, and `max-w-142.5`.
The rule is guidance, not a CI gate; adding automated enforcement would require a separate lint/policy design.

## Evidence
- `bun run check` after the rule update: passed (format, lint, policy tests 12/12, unit tests 12/12, build, typecheck).
- `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/home/madya/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome bun run test:e2e`: passed (home-page E2E 1/1).
- Search confirmed no old arbitrary max-width classes remain; canonical utilities appear in both routes.
- `git diff --check`: passed.
- The screenshot's classes now use Tailwind's exact suggestions. Their widths remain 1120px (`max-w-280`), 750px (`max-w-187.5`), and 570px (`max-w-142.5`).
- Governance-path changes are classified high risk. The rule is AI guidance, not a CI gate; automated enforcement would need a separate lint/policy design.
