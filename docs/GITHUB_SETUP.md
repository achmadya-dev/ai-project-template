# GitHub setup

This repository is a template. The instructions below apply to a new project created from it. GitHub branch protection is configured per repository and is not enabled by files in this template alone.

## Create a private repository

Use the GitHub UI to create a private repository from this template, or use the GitHub CLI:

```sh
gh repo create OWNER/PROJECT_NAME --private --template TEMPLATE_OWNER/TEMPLATE_REPO --clone
```

Replace the owner and repository names first. If the project directory already has Git history or a remote, do not initialize it or add another remote; inspect `git status` and `git remote -v` first.

Never commit `.env`, `node_modules`, build output, or credentials. Use `docs/tasks/TEMPLATE.md` for local planning when GitHub is unavailable. Do not invent historical issues or pull requests.

## After creating the repository

1. Enable Issues. GitHub Actions is not required; this template has no Actions workflow.
2. Open a test pull request using the template and link a real issue from the same repository. Run `bun run verify` locally and record the tested commit, results, and limitations in the PR.
3. Run the metadata verifier from a trusted base revision against the PR body and changed-file list; see `docs/WORKFLOW.md`. It is not a hosted check.
4. Add a ruleset for `main` when supported: require pull requests, block force pushes and branch deletion. Do **not** require `quality`, `database-and-browser`, `pr-contract`, or any other check that does not run. Remove those required checks from existing rulesets or branch protection before relying on this workflow; otherwise merges may remain blocked.
5. Do not grant agents or agent GitHub Apps ruleset bypass access.
6. Set `.github/CODEOWNERS` to a real account or team with write access.
7. If an independent reviewer is available, require a review and CODEOWNERS approval; dismiss stale approvals after code changes.
8. Keep auto-merge disabled until the workflow has been used and evaluated.

Rulesets and review protection for private repositories depend on the GitHub plan. If a control is unavailable, do not claim merges are protected. Use a documented manual gate with its limitations; do not fabricate a passing check.

## Solo workflow

GitHub does not allow an author to approve their own pull request. If you are the only human contributor, do not require an approval that cannot be provided. Run and record local verification, inspect the diff manually, then decide whether to merge. This is weaker than independent review and hosted checks. If a worker uses a separate identity, you may be able to review its pull request. Do not make an agent both author and approver.

## Issues and pull requests

```sh
bun run task:new first-feature
gh issue create --title "Plan: first feature" --body-file docs/tasks/first-feature.md
# After implementation and pushing the branch:
gh pr create --draft --title "feat: first feature" --body-file PATH_TO_PR_BODY.md
```

Complete the task document before creating the issue. Replace example paths with real files and use the actual issue number in the pull request template. The local PR verifier validates the issue-reference format, not whether the issue exists or is correct; a reviewer must check the link. Re-run it after editing the PR body or changing the file list.

## Local hooks and formatting

`bun install` runs `prepare` and installs Husky hooks in the local repository.

- `.husky/pre-commit` runs `bun run lint:staged`. Staged JS/TS files are fixed with ESLint and formatted with Prettier; CSS/JSON files are formatted with Prettier.
- `.husky/pre-push` runs `bun run check`, including `format:check`. This is a local convenience, not a remote gate; run `bun run verify` and any applicable optional provider suites before requesting review.
- `prettier-plugin-tailwindcss` uses `src/styles.css` as the Tailwind v4 stylesheet for sorting utility classes.
- `bun.lock` and generated `src/routeTree.gen.ts` are excluded from formatting.

To format or check the codebase manually:

```sh
bun run format
bun run format:check
```

Reinstall hooks after cloning or changing Git configuration with:

```sh
bun run prepare
```

Local Git hooks can be bypassed. Without hosted CI there is no independently enforced test gate: reviewers must assess the recorded commands, results, tested commit, and changed files themselves.

## Agent tools

- Codex / OpenCode: ask the agent to read `AGENTS.md`; automatic loading depends on the tool and version.
- Cursor: `.cursor/rules/project.mdc` points to `AGENTS.md`.
- Claude Code: `CLAUDE.md` points to `AGENTS.md`.
- ChatGPT without workspace/write access: use it for planning and send the task or issue to a coding agent. Do not assume read-only access can push changes.
- GitHub MCP access is optional. The repository stores no tokens; grant only the minimum access required and use tools that are actually available.

Dependabot updates follow the same issue and pull request contract. Create or link an issue, complete the pull request body, and classify dependency changes as high risk because dependencies execute as code. Do not configure a bot bypass.
