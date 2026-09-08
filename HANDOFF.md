# Handoff — THC Dziennik 1.1.0

Repository: https://github.com/megabomb420/thc-dziennik · branch `main`
Live app: https://megabomb420.github.io/thc-dziennik/

## Current product decisions

THC Dziennik is a local-first PWA for logging THC session times, built for self-control and reduction. It is deliberately dependency-free at runtime: five hand-written files (`index.html`, `style.css`, `icons.js`, `app.js`, `fx.js`) plus `sw.js` for offline. Vite is a dev server only — there is no build step and no bundler output. All state lives in `localStorage` (`thc_entries_v1`, `thc_settings_v1`); there is no account, no telemetry, no remote font and no third-party script.

The six methods are fixed: `dab`, `vape`, `vapor`, `smoke`, `edible`, `oil`. Their ids are storage keys written into every entry — rename one and old entries silently lose their method, so they must never change. Labels may change freely.

The daily session limit (`settings.goal`, 0 = unlimited) is the reduction lever. It drives the progress bar, the over-limit state and the "dziś sesji / limit dziennie" stats. Statistics and the 7-day chart count local calendar days (`sameDay`), never UTC.

All interface glyphs are inline SVG defined in `icons.js`. There are no emoji, no icon font and no external image assets in the UI. `icons.js` is the single source of truth: the `ICONS` map holds 24×24 path markup, `svgIcon(name, cls)` returns a complete `<svg>` string, and any element carrying `data-icon="name"` is filled in on load by `hydrateIcons()`. Icons inherit `currentColor` and scale with font size, so colour and sizing stay in CSS.

Each method owns one accent colour exposed as `--m` on `.m-dab` … `.m-oil`. That variable tints the method icon, the selected-method border and glow, and the history row tile, so a session is identifiable at a glance. The app identity is a seven-leaflet cannabis leaf, generated as geometry rather than traced by hand; the same paths are reused to rasterise the PWA icons.

Offline behaviour is network-first with a cache fallback: the service worker always tries the network, caches a good response, and serves the cache only when offline. Because of that, the `CACHE` constant in `sw.js` must be bumped on every release or installed clients can keep an old shell. `ASSETS` must list every file that has to exist offline.

Motion is progressive, not required: `prefers-reduced-motion` disables the canvas smoke, fireflies and bursts, and the orbit/aurora animations. Safe-area insets are handled for iPhone notch and home indicator.

## Release 1.1.0 — completed scope (2026-09-08)

- Every emoji in the interface was replaced by a drawn vector icon. The previous glyphs (💧💨🌬️🚬🍪🧴 for methods, plus logo, settings, save, clock, export, trash, close, toast and limit text) are gone; a repository-wide scan reports no emoji left in `index.html`, `app.js`, `style.css`, `icons.js` or `sw.js`.
- New `icons.js`: an `ICONS` map of inline SVG on a 24×24 grid, stroke-based with `currentColor`, plus `svgIcon(name, cls)` and a `[data-icon]` hydration pass. It is loaded before `fx.js`/`app.js` and added to the service-worker precache.
- Six method graphics are drawn objects rather than abstract symbols: dab = droplet over a heated nail, vape = pen with vapour, vaporizer = device with a screen, smoke = lit joint with ember and smoke, edible = cookie with chips, oil = dropper bottle. Each renders at 29px in the method grid and 19px in history tiles.
- Per-method accent colours (`--m`) now drive the method icon, the active-method border/glow and the history tile border and tint. `color-mix()` carries the tinted surfaces, with plain rgba/hex fallback declarations before each one so older Safari still renders a coherent (green) state instead of dropping the rule.
- The logo is now a generated seven-leaflet cannabis leaf (symmetric, with a stem), used in the header, in the empty-state illustration and as the basis for the PWA icons. `icons/icon-192.png`, `icons/icon-512.png` and `icons/icon-512-maskable.png` were regenerated from that same geometry with a gradient fill, glow and a full-bleed background for the maskable variant. `manifest.webmanifest` paths were unchanged.
- Supporting polish: empty state is an illustration plus copy instead of one sentence; the goal line carries a sliders icon (and a red alert icon when the limit is exceeded); toasts render an icon next to the message (`toast(msg, iconName)` now builds `innerHTML`); icon-only buttons got `aria-label`, method buttons got `aria-pressed`.
- `sw.js` cache bumped `thc-dziennik-v6` → `v7` and `./icons.js` added to `ASSETS`. Version metadata is 1.1.0 in `package.json` and the footer (`v1.1`).

Validation: `node --check` on `app.js`, `icons.js` and `fx.js`. Headless Chrome (Playwright, channel `chrome`) at 390×844 mobile and 900px desktop, with seeded data and with cleared storage: 6 method icons present, no emoji in visible text, logo SVG rendered, toast carries an icon, method select → log → toast → history → delete all work, and the console reported no errors or page errors. Production smoke test against the live Pages URL after deploy: `icons.js` 200, `index.html` carries `data-icon="leaf"` and `icons.js`, `sw.js` reports cache v7, `icon-512.png` is the new 156 KB asset, 6 method icons, service worker active, zero console errors and zero failed requests.

## Pause / resume point

Baseline for any resume is commit `acb967e` on `main` ("🌿 Wektorowe ikony zamiast emoji…"); the live site is the Pages build of that commit. This file did not exist before 1.1.0 — there is no earlier handoff to reconcile.

Known gaps, none of them blockers:

- Only headless Chrome was used. Physical iOS Safari has not been tested; the safe-area and `color-mix` fallbacks are written for it but unverified on hardware.
- `preview.png`, `preview2.png` and `preview3.png` in the repository are stale pre-1.1 screenshots (420px-wide crops) and are not referenced by the README. Either regenerate them from the current UI or delete them; do not treat them as documentation.
- `icons/icon-512-maskable.png` is not listed in `sw.js` `ASSETS` (pre-existing). It is only needed at install time, so this is harmless, but adding it keeps the precache complete.
- The repository has no test tooling and no CI beyond the Pages build. Verification is manual plus ad-hoc Playwright scripts; do not assume a `npm test` exists.

## Validation and release

Local run: `npm install` then `npm run dev` (Vite), or any static server such as `python -m http.server` from the repository root. The app needs an HTTP origin for the service worker; `file://` will load but stay uncached.

Release procedure: push the release commit to `main`, let the legacy Pages build finish, then confirm the live footer shows the new version and `sw.js` shows the new `CACHE` name. Installed clients pick up the new worker through the `controllerchange`/`SW_UPDATED` reload path in `index.html`.

Smoke checklist:

1. Fresh storage: header logo renders, empty state shows the leaf illustration.
2. Tap each of the six methods — the active border and glow use that method's colour.
3. Log now with a note and amount → toast shows the method icon → the entry appears in history with its coloured tile → delete it.
4. "Wybierz godzinę" → quick chip and exact datetime both create a backdated entry.
5. Settings: set a daily limit → progress bar fills; exceed it → bar and label turn red with the alert icon. Wipe data returns to the empty state.
6. Chart: seven local weekdays, today's bar highlighted, zero days show only the baseline stub.
7. Production: install/refresh, go offline, confirm the app still loads and existing entries persist.

## Maintenance

`icons.js` is the only place a glyph should be added. Add the 24×24 path markup to `ICONS`, then reference it with `svgIcon('name')` from JS or `data-icon="name"` from HTML; do not inline one-off SVGs into `app.js` or `index.html`. Method icons are keyed by the method id, so a new method needs both an `ICONS` entry and a `.m-<id>` colour rule.

Treat `thc_entries_v1` / `thc_settings_v1` and the method ids as a storage contract: migrate rather than rename. Keep the app dependency-free at runtime — dev dependencies are fine, shipped ones are not. Bump `CACHE` in `sw.js` and extend `ASSETS` on every release that touches cached files. Keep numeric and statistical behaviour (local calendar days, average gap, limit semantics) unchanged unless the change is deliberate and documented here.
