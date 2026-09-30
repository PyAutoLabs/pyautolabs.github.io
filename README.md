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

Choose an organ from the icon-and-label bar to open its board inside the cockpit.
**Overview** returns to the status cards. Board selections have bookmarkable URLs
(for example `/cockpit/#heart`), and browser Back/Forward follows those selections.
The bar scrolls horizontally on phones; landscape mode makes it more compact.
Reload refreshes the selected board, while **New tab** explicitly opens it separately.
GitHub and documentation links inside same-origin boards open separately.

The cockpit adapts to narrow screens, but embedded boards retain their own layouts:
the Eyes board currently requires horizontal scrolling on phone widths.

For a local preview, run `python3 -m http.server 8000` from this repository and
open `http://localhost:8000/cockpit/`. It displays live published boards. Because
those boards are cross-origin in a localhost preview, their internal links cannot
be integrated with the shell; test full navigation on the shared Pages origin.

- Feed contract: PyAutoBrain `board/state_schema.json` (v1:
  `schema_version`, `organ`, `repo`, `status` ∈ green/yellow/red/stale/grey,
  `headline`, `updated`, `pages_url`, `items[{severity, text, url, prompt}]`).
- Adding an organ = one line in the `ORGANS` array at the top of
  `cockpit/index.html` (include an `icon`; `feed: null` until it publishes).
- The Gut's card reads the [Gut board](https://pyautolabs.github.io/PyAutoGut/)
  feed: yellow when condemned refs are due for voiding (or orphaned /
  dangling), and each due item links the board's one-tap "Void permanently"
  issue.
- The Nerves' card reads the [Nerves board](https://pyautolabs.github.io/PyAutoNerves/)
  feed (PyAutoNerves#172) — a read-only browser of every config file and option
  across the libraries and workspaces: yellow when a config file does not parse
  or a workspace sets keys no library defines.
