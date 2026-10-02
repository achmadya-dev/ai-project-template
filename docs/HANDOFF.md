# Session handoff

Task: docs/tasks/001-bun-migration.md
Repository: https://github.com/achmadya-dev/ai-project-template
Issue: https://github.com/achmadya-dev/ai-project-template/issues/8
Branch: chore/bun-package-manager
State: migration scope now includes Bun as the application runtime. Earlier package-manager-only checks passed, but the final Bun-runtime revision requires its own hosted CI evidence; see docs/VALIDATION.md and the current PR checks. Changes require review before merge. No deployment performed.

## Next action
Review the current PR checks, including Bun production smoke. After merge, use Bun commands in README. Node 24 remains only for the current Vitest/Playwright test tooling, not the application runtime. For a new business project, read START_HERE.md and fill product/domain context.
