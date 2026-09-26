# pyautolabs.github.io

The PyAuto front door — a static hub linking the documentation, example
workspaces, tutorial courses and AI-assistant path for the PyAuto software
stack (PyAutoFit, PyAutoGalaxy, PyAutoLens).

Served by GitHub Pages at **https://pyautolabs.github.io**.

- `index.html` — the whole site: self-contained (no external assets, no build
  step), light/dark via `prefers-color-scheme`.
- `RETROFIT.md` — how to move this and the docs onto paid custom domains later;
  the site intentionally runs on free infrastructure today.

Per-project documentation stays on ReadTheDocs (canonical URLs); this site is
the cross-project landing layer only.

## Cockpit

`cockpit/` is an installable page (a PWA) at
**https://pyautolabs.github.io/cockpit/** that reads every organ's live status
feed — `https://pyautolabs.github.io/<Repo>/state.json` — and shows the Heart
pinned first, then one card per organ in canonical order. It polls every 60 s,
badges the app icon with the red-item count and, once the 🔔 is granted, sends a
local notification when any organ's status changes. No server, no secrets: the
feeds are the truth.

- Feed contract: PyAutoBrain `board/state_schema.json` (v1:
  `schema_version`, `organ`, `repo`, `status` ∈ green/yellow/red/stale/grey,
  `headline`, `updated`, `pages_url`, `items[{severity, text, url, prompt}]`).
- Adding an organ = one line in the `ORGANS` array at the top of
  `cockpit/index.html` (`feed: null` until it publishes).
