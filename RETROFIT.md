# Custom-domain retrofit

This site and the PyAuto docs deliberately run on **free infrastructure**:

- Hub: https://pyautolabs.github.io (GitHub Pages default domain)
- Docs: `pyautofit` / `pyautogalaxy` / `pyautolens` `.readthedocs.io` (canonical,
  deeply linked from papers and issues — these stay canonical regardless)

Decision record: [PyAutoLabs/PyAutoFit#1341](https://github.com/PyAutoLabs/PyAutoFit/issues/1341)
and [#1 on this repo](https://github.com/PyAutoLabs/pyautolabs.github.io/issues/1).
As of 2026-07-09, `pyautolens.org`, `pyautofit.org`, `pyautogalaxy.org`,
`pyautolabs.org` and `pyauto.org` were all unregistered.

Everything is structured so that adding paid domains later is configuration
only — no content restructuring:

## Upgrading later

1. **Register the domain(s)** (e.g. `pyautolabs.org` as a single umbrella, or
   per-project `pyautolens.org` etc.).
2. **Hub** → repo *Settings → Pages → Custom domain* (e.g. `www.pyautolabs.org`),
   plus a DNS `CNAME` record pointing at `pyautolabs.github.io`. GitHub
   provisions TLS automatically. Internal links in `index.html` are relative or
   absolute-to-other-hosts, so nothing changes.
3. **Docs** → each ReadTheDocs project's *Settings → Domains* (e.g.
   `docs.pyautolens.org`), plus a DNS `CNAME` per RTD's instructions. RTD keeps
   the `*.readthedocs.io` URLs working and redirecting, so existing deep links
   are unaffected.
