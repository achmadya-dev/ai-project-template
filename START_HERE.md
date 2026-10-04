# Start here

## 1. Make this project yours

Create a repository from this template, open it, and follow the setup in the README. Change the project name in `package.json` and `.ai/project.json`, then run `bun install --lockfile-only` to update package metadata in the lockfile.

Fill in these files with your agent before adding a business feature:

- `docs/PRODUCT.md`: users and the outcome the product should deliver.
- `docs/DOMAIN.md`: business rules, examples, and exceptions.
- `docs/ARCHITECTURE.md`: project-specific decisions, especially authentication, tenancy, and hosting.

Do not define every possible feature upfront. Start with one end-to-end workflow that can be demonstrated.

## 2. First prompt

Read `AGENTS.md` and the documents it references. I want to use this repository for [product], for [users], so they can [outcome]. Propose an MVP with a narrow scope and acceptance criteria. Identify unresolved business decisions. Update `docs/PRODUCT.md` and `docs/DOMAIN.md`. Create a GitHub planning issue if access is available; otherwise, create a local task from `docs/tasks/TEMPLATE.md`. Do not implement a business feature yet.

## 3. Implementation prompt

Implement [issue number or task path] according to the accepted plan revision. Read `AGENTS.md`, inspect Git status, create a separate branch, implement the change, run relevant verification, and record evidence. Prepare a pull request if access is available. Ask a question only when a material decision is unresolved or an action exceeds the existing authorization. Do not merge or deploy.

## 4. Start a new session

Name the repository, branch, and task. Ask the agent to read the task and `docs/HANDOFF.md`; do not rely on chat memory. Use separate repositories for separate projects. For parallel tasks in one repository, use separate branches and worktrees; do not let two agents edit the same checkout.

## 5. Use GitHub

See `docs/GITHUB_SETUP.md` for repository setup, issues, and branch protection. Once the template repository is ready, enable GitHub's **Template repository** setting and use **Use this template** for new projects.

## 6. Review the result

Ask for a behavior demo, acceptance-criteria evidence, test results, and recovery limits. Judge the result by behavior, not by file count or explanation length. For authentication, data, or money changes, review domain decisions and negative test cases explicitly.
