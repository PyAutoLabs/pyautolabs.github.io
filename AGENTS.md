# AGENTS.md

This file is for AI coding agents (Claude Code, Codex, Cursor, etc.) and humans
working in this repository. It is the agent-agnostic source of truth; Claude Code
loads it via the `@AGENTS.md` import in `CLAUDE.md`.

## What this repo is

**pyautolabs.github.io is the PyAuto front door** — a single static hub that links
the documentation, example workspaces, tutorial courses and AI-assistant path for
the PyAuto software stack (PyAutoFit, PyAutoGalaxy, PyAutoLens). It is served by
GitHub Pages at **https://pyautolabs.github.io**.

It is the cross-project **landing layer only**. Per-project documentation stays on
ReadTheDocs (the canonical URLs); this site links out to it rather than
duplicating it.

## Layout

- `index.html` — the entire site. **Self-contained**: no external assets, no build
  step, no framework. Light/dark is handled via `prefers-color-scheme`.
- `RETROFIT.md` — how to move this hub and the docs onto paid custom domains
  later; the site intentionally runs on free infrastructure today.
- `README.md` — this repo's own short summary.

## Working here

- **No build step.** Edit `index.html` directly and open it in a browser to
  preview. GitHub Pages serves it as-is when the default branch is pushed.
- **Keep it self-contained.** Do not add external scripts, stylesheets, fonts or
  images — inline everything so the page has no runtime dependencies.
- **Landing layer only.** Link out to ReadTheDocs and the workspace/tutorial
  repos; don't copy per-project documentation into this site.
- **Support light and dark** via `prefers-color-scheme`, matching the existing
  page.

<!-- repos_sync:history:begin -->
## Never rewrite history

Never rewrite pushed history on any repo with a remote — no `git init` over a
tracked repo, no force-push to `main`, no fresh-start "Initial commit", no
`filter-repo` / `filter-branch` / `rebase -i` on pushed branches. To get a
clean tree: `git fetch origin && git reset --hard origin/main && git clean -fd`.
<!-- repos_sync:history:end -->

<!-- repos_sync:deliverable:begin -->
## Sessions end at their deliverable

A session ends when it reports its deliverable — never arm anything that
outlives the turn to wait for CI, a review or a merge: no `send_later`, no
`subscribe_pr_activity`, no `CronCreate`, no `ScheduleWakeup`, no `/loop`, no
`RemoteTrigger` create/update/run. Judge once, report, stop; the human re-runs
`/prm` (or the batch review) when it is green. Measured: five batch members
armed hourly check-ins on 2026-08-31, and a mobile `/prm` re-armed a 60-minute
`send_later` hourly all night on 2026-09-03 with no task active, draining usage.
<!-- repos_sync:deliverable:end -->
