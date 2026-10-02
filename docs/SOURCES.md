# Primary references checked during bootstrap

Accessed 2026-10-02. Installed package code and executed checks take precedence over examples for the exact pinned versions.

- https://tanstack.com/start/latest/docs/framework/react/build-from-scratch
- https://tanstack.com/start/latest/docs/framework/react/guide/server-functions
- https://tanstack.com/start/latest/docs/framework/react/guide/hosting
- https://agents.md/
- https://opencode.ai/docs/rules/
- https://cursor.com/docs/context/rules
- https://code.claude.com/docs/en/hooks
- https://docs.github.com/en/actions/reference/security/secure-use
- https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository

## Bun package management and runtime
- https://bun.sh/docs/pm/cli/install
- https://bun.sh/docs/pm/lockfile
- https://bun.sh/docs/runtime
- https://bun.sh/docs/runtime/bunfig
- https://bun.sh/guides/ecosystem/vite
- https://github.com/oven-sh/setup-bun
- https://docs.github.com/en/code-security/reference/supply-chain-security/supported-ecosystems-and-repositories

TanStack Start's current React hosting guide documents Bun deployment for React 19 and the Nitro `bun` preset. Bun's Vite guide documents `--bun` for running the Vite CLI on Bun instead of following its Node shebang. Vitest and Playwright documentation still list Node prerequisites, so Node remains test tooling only rather than the application runtime.
