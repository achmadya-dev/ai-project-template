# Local prototypes and planning visuals

Use a prototype when a concrete layout, interaction, or state question is hard to settle in text. It is optional evidence for planning, not proof that a feature is implemented or permission to start production work.

## Local-only workspace

From the repository root:

```sh
mkdir -p prototypes
```

`prototypes/` and everything inside it are ignored by Git, excluded from the Docker build context, and excluded from routine ESLint/Prettier checks. No placeholder file is committed: Git does not retain empty directories, so create the directory in each new clone. The maintained instructions live here, outside the ignored directory.

An example local layout (not committed):

```text
prototypes/
  service-cards/
    NOTES.md
    index.html
    styles.css
    app.js
    screenshots/
      desktop.png
      mobile.png
```

HTML/CSS/JS, a small framework app, or a logic experiment are all valid. Pick the smallest tool that answers the question. Keep any prototype-specific dependencies and lockfiles inside the prototype directory; do not change the application's dependencies for a throwaway experiment. Do not import prototype code into `src/`, put it in public assets, or add application routes for it.

The ignore rules prevent accidental staging, not all uploads: never use `git add -f` for this workspace. Review the staged files before committing. It is not backed up by a Git push and is not a safe place for credentials or customer data.

## Planning loop

1. Record the question and acceptance criteria in the issue, or a local task if GitHub is unavailable. Stay in plan-only mode when requested.
2. If visual exploration helps, create a narrowly scoped prototype under `prototypes/<task-slug>/`. Record the question, assumptions, mocked behavior, one run command, and limitations in a local `NOTES.md`.
3. Use synthetic data and clearly label the UI **Planning prototype — not implemented**. Do not connect real payments, production APIs, credentials, or databases. Default to in-memory state.
4. Open static HTML directly when possible. If a server is needed, bind to `127.0.0.1`, serve only the prototype directory (not the repository root), and stop it when finished. For example, if Python 3 is available:

   ```sh
   python3 -m http.server 4173 --bind 127.0.0.1 --directory prototypes/service-cards
   ```

5. Inspect the intended states and responsive sizes. Save screenshots under the prototype's `screenshots/` directory. Include desktop/mobile when layout behavior is in question; capture loading/empty/error states when relevant.
6. Attach selected, sanitized screenshots to the planning issue or a linked issue comment. Include the question, viewport, assumptions, mocked interactions, and proposed decision. Mark them as concepts, not completed implementation.
7. Record the accepted decision in the issue/task (or an ADR if durable). A plan-only request stops here. Implement only the accepted, authorized scope in the real application with its normal tests; do not treat prototype code as production-ready.

With a GitHub CLI version that supports `--attach`, for example:

```sh
# Set ISSUE to an existing issue number in this repository first.
gh issue comment "$ISSUE" \
  --body "Planning concept, not implemented. Service cards at 1440px and 390px; synthetic data." \
  --attach 'prototypes/service-cards/screenshots/desktop.png#Desktop planning concept at 1440px' \
  --attach 'prototypes/service-cards/screenshots/mobile.png#Mobile planning concept at 390px'
```

If `--attach` is unavailable, upload through the GitHub issue editor or report the missing upload step; never post a local filesystem path as if it were a viewable image. Check the published comment and link it from the issue. Upload only the chosen screenshots, not the whole workspace.

## Handoff and retention

Planning images explain the proposal; implementation PRs need screenshots of the actual changed application, following [UI review evidence](WORKFLOW.md#ui-review-evidence). Do not reuse a concept capture as evidence that the feature works.

Keep useful experiments locally while the task is active. The issue/task carries the durable decision and selected visuals, because another clone will not have these files. Do not automatically delete the workspace during branch cleanup or overwrite existing prototypes. Ask before destructive prototype cleanup. Promote a validated idea by deliberately implementing it in maintained source, not by force-adding this directory.
