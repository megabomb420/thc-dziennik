# Handoff — THC Dziennik 1.1.0

Repository: https://github.com/megabomb420/thc-dziennik · branch `main`
Live app: https://megabomb420.github.io/thc-dziennik/

## Current product decisions

THC Dziennik is a local-first PWA for logging THC session times, built for self-control and reduction. It is deliberately dependency-free at runtime: five hand-written files (`index.html`, `style.css`, `icons.js`, `app.js`, `fx.js`) plus `sw.js` for offline. Vite is a dev server only — there is no build step and no bundler output. All state lives in `localStorage` (`thc_entries_v1`, `thc_settings_v1`); there is no account, no telemetry, no remote font and no third-party script.

The interface is bilingual: English is the default and Polish is selectable in Settings. All copy lives in `i18n.js` (`STRINGS.en` / `STRINGS.pl`) and is read through `t(key, vars)`; static markup carries `data-i18n`, `data-i18n-placeholder`, `data-i18n-title` or `data-i18n-aria` and is filled by `apply()`. Dates, times and weekday labels follow the active locale (`en-GB` / `pl-PL`), and `app.js` re-renders the dynamic parts from `window.onLangChange`. The choice is stored as `settings.lang`; anything unknown falls back to English.

The six methods are fixed: `dab`, `vape`, `vapor`, `smoke`, `edible`, `oil`. Their ids are storage keys written into every entry — rename one and old entries silently lose their method, so they must never change. Labels may change freely.

The daily session limit (`settings.goal`, 0 = unlimited) is the reduction lever. It drives the progress bar, the over-limit state and the "dziś sesji / limit dziennie" stats. Statistics and the 7-day chart count local calendar days (`sameDay`), never UTC.

All interface glyphs are inline SVG defined in `icons.js`. There are no emoji, no icon font and no external image assets in the UI. `icons.js` is the single source of truth: the `ICONS` map holds 24×24 path markup, `svgIcon(name, cls)` returns a complete `<svg>` string, and any element carrying `data-icon="name"` is filled in on load by `hydrateIcons()`. Icons inherit `currentColor` and scale with font size, so colour and sizing stay in CSS.

Each method owns one accent colour exposed as `--m` on `.m-dab` … `.m-oil`. That variable tints the method icon, the selected-method border and glow, and the history row tile, so a session is identifiable at a glance. The app identity is a seven-leaflet cannabis leaf, generated as geometry rather than traced by hand; the same paths are reused to rasterise the PWA icons.

Offline behaviour is network-first with a cache fallback: the service worker always tries the network, caches a good response, and serves the cache only when offline. Because of that, the `CACHE` constant in `sw.js` must be bumped on every release or installed clients can keep an old shell. `ASSETS` must list every file that has to exist offline.

Motion is progressive, not required: `prefers-reduced-motion` disables the canvas smoke, fireflies and bursts, the orbit/aurora animations, and the card scroll flow. Safe-area insets are handled for iPhone notch and home indicator.

The app is meant to feel native rather than like a web page. Pinch zoom and double-tap zoom are blocked at three levels: the viewport meta (`user-scalable=no, maximum-scale=1`), `touch-action: pan-x pan-y` on the root, and JS guards in `fx.js` for iOS `gesture*` events, multi-finger `touchstart`, and a second tap inside 320 ms on non-control surfaces. `overscroll-behavior-y: none` removes rubber-band and pull-to-refresh. Text fields stay at 16px on touch devices, because that is the only dependable way to stop iOS focus zoom; on fine-pointer devices they are 14px, and placeholders are 14px everywhere.

Cards are animated from JS, never CSS, so a JS failure leaves the page readable. `fx.js` writes only the independent `translate`, `scale` and `opacity` properties; the pointer tilt keeps using `transform`, so the two never overwrite each other. The loop is rAF-driven with per-frame lerp smoothing, stops when settled, and restarts on scroll, resize, visibility change and any body resize.

## Release 1.3.4 — completed scope (2026-09-08)

- **Import.** Export without import was half a backup. The history header now carries Export and Import side by side. Import reads a JSON file through a hidden `<input type="file">`, parses it defensively, runs the same `sanitizeEntries`/`sanitizeSettings` used on load, then asks whether to Replace all (entries plus the file's goal and language) or Merge (append, skipping any entry whose id already exists). A malformed file or a JSON without an `entries` array shows an error toast and changes nothing. Escape, backdrop click and Cancel all close the dialog through the shared modal machinery.
- **The deployed site no longer ships the repository.** Pages moved from the legacy branch build to a GitHub Actions deployment (`.github/workflows/pages.yml`) that copies only the app files into `_site` and uploads that. `tests/`, `scripts/`, `playwright.config.mjs`, `package.json` and the README are no longer served from the public site.
- Version metadata 1.3.4 and `sw.js` `CACHE` bumped `v13` → `v14`.

Validation: `npm test` — 11/11, including two new import tests (merge skips a colliding id and reports the count; replace swaps entries, goal and language; a malformed file and a JSON without `entries` both leave the journal untouched). Manual check at 390px: the header shows Export + Import at 44px with no horizontal overflow, and the import dialog renders Replace all / Merge / Cancel. After the Pages switch, the live site returns 404 for `tests/smoke.spec.mjs` while the app itself is unchanged.

## Release 1.3.3 — completed scope (2026-09-08)

Finishing pass toward 10/10 — the gaps left open by 1.3.2, plus a bug the new tests found.

- **The first visit no longer reloads the page.** The service worker's `clients.claim()` fired `controllerchange` on first install and the inline handler reloaded unconditionally, throwing away the first load and any input typed in that window. All three reload paths (`controllerchange`, `SW_UPDATED`, `updatefound` → activated) now run only when `navigator.serviceWorker.controller` already existed, i.e. on a genuine update. Verified: exactly one navigation on first visit with the worker active.
- **Modal focus management.** `openModal`/`closeModal` remember the trigger, move focus into the dialog (`.modal-box` is `tabindex="-1"`), trap Tab/Shift+Tab inside it, close on Escape — the settings modal routes through `closeSettings`, so a language preview is reverted too — and return focus to the trigger on close. Clicking the settings backdrop now also closes it.
- **Remaining accessibility gaps closed.** The chart is one `role="img"` with a generated label ("Bar chart, last 7 days: We 2, Th 5, …"); the method grid is an `aria-label`ed `role="group"`; delete buttons name their entry ("Delete Dry herb vape entry"); the amount field uses `inputmode="decimal"` and both log inputs opt out of autofill.
- **Dead setting removed.** The Nickname field was stored but never displayed anywhere; it is gone from the modal, the schema and the strings.
- **One source for the version.** `APP_VERSION` in `i18n.js` feeds the footer through a `{v}` placeholder, so only `package.json` and that constant need bumping (previously three places).
- **Timestamps are validated.** `addEntry` rejects a non-finite timestamp, and "pick a time" reports an invalid date instead of writing `NaN` into storage.
- **Cheaper canvas.** The FX canvas caps DPR at 1.5 (soft smoke does not need 2×) and skips drawing while the document is hidden.
- **Tests and CI.** `tests/smoke.spec.mjs` (Playwright, 9 tests) covers load/empty state, logging, the daily limit and its over state, deletion, the EN/PL switch with Cancel reverting, Escape closing a modal with focus return, HTML injection through a note, a corrupted `localStorage`, and offline operation. `scripts/serve.mjs` is a dependency-free static server for the test run; `.github/workflows/ci.yml` runs `npm ci` → `playwright install chromium` → `npm test` on every push and PR.

Validation: `npm test` — 9/9. Full audit re-run: 16/16 functional and resilience checks pass (no XSS execution, corrupted storage recovers with zero page errors); accessibility reports zero unnamed controls, zero unlabelled inputs, zero sub-44px targets, footer contrast 7.76:1, toast `aria-live="polite"`, both dialogs `role="dialog" aria-modal="true"` and an `h1` present; Chromium idles at 57–60 fps; headless WebKit still logs, switches language and animates with no console errors. The new suite also caught the first-visit reload bug above, which no earlier pass had exercised.

## Release 1.3.2 — completed scope (2026-09-08)

Fixes from a full test pass (Chromium + WebKit: functional, resilience, accessibility, PWA, performance).

- **Storage can no longer kill the app.** Both reads went through a bare `JSON.parse`, so one malformed byte in `thc_entries_v1` or `thc_settings_v1` threw during init and left a dead page. `readJSON()` now swallows parse errors; `loadEntries()` keeps only objects with a finite numeric `t` and normalises every field; `loadSettings()` clamps `goal` to 0–50, slices `nick` and whitelists `lang`. `save()` is wrapped in try/catch and reports a storage-full toast instead of throwing.
- **No more HTML injection.** `renderHistory` interpolated `note`, `amount` and `id` into `innerHTML` unescaped — a note of `<img src=x onerror=…>` executed. Every user-derived value now goes through `esc()`, in both text and the `data-id` attribute, and `toast()` escapes too. Method labels come from the trusted i18n table.
- **Accessibility.** The two log inputs gained a translatable `aria-label` (`amountAria` / `noteAria`) — previously they had only a placeholder. The toast is `role="status" aria-live="polite"`. Both modals are `role="dialog" aria-modal="true"` with `aria-labelledby`, and a visually hidden `<h1>` supplies the page's top heading. Delete, export and settings controls now meet the 44px touch minimum; footer contrast rose from 2.86:1 to 7.76:1; keyboard focus is an explicit 2px accent ring.
- **Performance.** The five cards carried `backdrop-filter: blur(12px)`, which measured **31.3 fps versus 60.3 fps** without it in Chromium; the blur is gone and the card background is slightly more opaque, visually equivalent on this background. The scroll-flow lerp was per-frame, so settle time scaled with frame rate (0.5 s at 34 fps versus 3.5 s at 7.5 fps in headless WebKit); it is now time-based (`1 - 0.82^dt`) and settles in ~0.56 s even at 7.7 fps.
- Version metadata 1.3.2 and `sw.js` `CACHE` bumped `v11` → `v12`.

Validation: the same audit re-run. Functional/resilience — 16/16 checks pass including the two former failures: a note of `<img src=x onerror=…>` no longer executes, and a deliberately corrupted `thc_entries_v1` / `thc_settings_v1` now leaves 6 methods, a working `i18n` and a bound save button with zero page errors. Accessibility (measured with reduced motion so card scale does not distort boxes) — zero controls without an accessible name, zero inputs without a label, zero targets under 44px, toast live region `polite`, both modals `role="dialog" aria-modal="true"`, an `H1` present, footer contrast 7.76:1. Performance — Chromium idle frame rate 31.3 → 60.3 fps; scroll-flow settle in headless WebKit 3529 ms → 561 ms with max frame-to-frame jump 2.26 → 0.4 px; Chromium reports zero moved frames once settled. WebKit re-run: logging, i18n switch and the scroll flow all work, no console errors.

## Release 1.3.1 — completed scope (2026-09-08)

- **The language select now behaves like the rest of the form.** 1.3.0 applied and persisted the language the moment the dropdown changed, which made Cancel a lie. Changing the dropdown is now a live preview only: it re-renders the UI so the choice can be judged, but `settings.lang` is untouched until Save. Cancel — and the wipe action, which also closes the modal — restore the language that was active when the modal opened. Save writes `settings.lang` and re-bases that restore point, so a later Cancel does not undo a committed choice.
- Version metadata 1.3.1 (both footer strings in `i18n.js`, `package.json`) and `sw.js` `CACHE` bumped `v10` → `v11`.

Validation: headless Chrome at 390×844. Open Settings and switch to Polski — the UI switches live while the modal stays open; press Cancel — the UI and `document.documentElement.lang` return to English and a reload confirms `settings.lang` is still `en`. Repeat and press Save — Polish persists across a reload. The wipe-data path also restores the pre-open language. No console errors.

## Release 1.3.0 — completed scope (2026-09-08)

- **English is now the default language; Polish moved into Settings.** A new `i18n.js` holds both string tables and exposes `i18n.t(key, vars)`, `i18n.setLang(code)`, `i18n.locale()` and `i18n.weekdays()`. Static copy in `index.html` is marked with `data-i18n` / `data-i18n-placeholder` / `data-i18n-title` / `data-i18n-aria` and applied on load and on every change; `document.documentElement.lang` and `document.title` follow the choice. `app.js` reads every user-facing string through `t()` and re-renders methods, stats, chart and history from `window.onLangChange`, so switching is instant with no reload. Any unknown or missing `lang` falls back to English.
- Dates, times and the chart's weekday initials are locale-driven: `en-GB` (`8 Sept 20:20`, `Su Mo Tu…`) versus `pl-PL` (`8 wrz 20:20`, `Nd Pn Wt…`).
- The settings modal gains a Language `<select>` (English / Polski). Changing it applies and persists immediately as `settings.lang`, independent of Save/Cancel — those still handle the limit and nickname.
- Method labels are translated; the dry-herb device is labelled **"Dry herb vape"** in both languages, keeping it distinct from the separate "Vape" (cart/pod) method.
- `manifest.webmanifest` name, description and `lang` switched to English, since the default install is English. `package.json` is 1.3.0, the footer is `v1.3.0`, and `sw.js` `CACHE` moved `v9` → `v10` with `./i18n.js` added to `ASSETS`. Export filenames changed from `thc-dziennik-<date>.json` to `thc-journal-<date>.json`.

Validation: `node --check` on all four JS files. Headless Chrome at 390×844 with a profile carrying no stored `lang`: English everywhere — html lang `en`, title `THC Journal — control & reduction`, "Log now", "sessions today", "Dry herb vape", weekdays `We,Th,Fr…`, entry stamp `8 Sept 20:20`, footer v1.3.0. Selecting Polski in Settings switched every string without a reload — html lang `pl`, "Zapisz teraz", "dziś sesji", "Olejek/Tincture", weekdays `Śr,Cz,Pt…`, stamp `8 wrz 20:20` — and the choice survived a reload; switching back restored the English copy and date format. Icons survived every text swap, because translated strings sit in dedicated spans and never on the `data-icon` element. No console errors.

## Release 1.2.1 — completed scope (2026-09-08)

- **The save button was too loud.** The primary button's sheen (`::before`) went from `rgba(255,255,255,.45)` every 3.2 s to `rgba(255,255,255,.14)` every 6.5 s with a longer idle phase; base shadow `0 4px 18px rgba(34,197,94,.35)` → `0 3px 14px rgba(34,197,94,.26)`; hover glow `.5` → `.32` and `brightness(1.06)` → `1.03`; press `scale(.97)` → `scale(.98)`. The save burst dropped from 46 particles at speed 2–8 to 22 at speed 2–5, radius 2–6 → 2.2–4.8, glow blur 12 → 9, alpha `life` → `life * 0.8`. Note that the burst is only ever visible outside the card: the canvas sits under `.app`, so particles spawned at the button centre are hidden until they clear the card edge. That was already true before this release.
- **Input labels were too large.** The 16px floor added in 1.2.0 stays on the field itself, but placeholders are back to 14px and fine-pointer devices drop the field back to 14px too. Touch devices keep 16px, so iOS still does not zoom on focus.
- Version metadata 1.2.1 (`package.json`, footer `v1.2.1`) and `sw.js` `CACHE` bumped `v8` → `v9`.

Validation: `node --check fx.js`. Computed styles with the real app: mobile context (390×844, touch) reports input `16px`, placeholder `14px`, sheen `6.5s`, button shadow `rgba(34,197,94,.26) 0 3px 14px`; desktop context (900px, fine pointer) reports input `14px`, placeholder `14px`. Screenshots of the log card confirm the smaller labels; burst frames 300 ms and 600 ms after saving show a soft spray of a few particles below the card rather than an explosion. No console errors.

## Release 1.2.0 — completed scope (2026-09-08)

- **Zoom is blocked.** Viewport meta now carries `maximum-scale=1.0, user-scalable=no`. `html` gets `touch-action: pan-x pan-y` (no pinch, no double-tap zoom, scrolling still works) and `overscroll-behavior-y: none` on `html`/`body`. Because iOS ignores the meta tag, `fx.js` also prevents `gesturestart`/`gesturechange`/`gestureend`, cancels any `touchstart` with more than one finger, and cancels a second `touchend` inside 320 ms — but only when it does not land on a control (`button, a, input, textarea, select, label, .method, .chip, .btn`), so rapid taps on the save button still register. Buttons and chips carry `touch-action: manipulation`. Text inputs were raised to 16px (`.log-extras input`, `.modal-box input`, the datetime field) to stop iOS focus auto-zoom.
- **Cards flow while scrolling.** Each `.card` starts at `translate 0 34px`, `scale .96`, `opacity 0` and eases to rest as it rises into the viewport. Progress is the card's distance from the viewport bottom over 62% of viewport height, run through a smoothstep, then lerped 0.18 per frame so the motion trails the scroll instead of snapping to it. The loop only writes `translate`, `scale` and `opacity`; the desktop tilt in `fx.js` still owns `transform`, so both compose. It is driven by rAF and stops once settled, waking on scroll/resize/visibilitychange and a `ResizeObserver` on `body` (so adding a history entry re-settles the layout). With `prefers-reduced-motion` the block is skipped entirely and no inline styles are written.
- Version metadata 1.2.0 (`package.json`, footer `v1.2`) and `sw.js` `CACHE` bumped `v7` → `v8`. No changes to storage, statistics or the icon set.

Validation: `node --check fx.js`. Headless Chrome at 390×844 with touch enabled: viewport meta correct, computed `touch-action: pan-x pan-y`, computed `overscroll-behavior-y: none`, synthetic two-finger `touchstart` cancelled, `gesturestart` cancelled, second rapid `touchend` cancelled — all four reported `defaultPrevented: true`. Card state sampled at three scroll positions: below the fold cards sat at `op .2 / ty 34 / sc .96`, and every card reached `op 1 / ty 0 / sc 1` once scrolled into view. Desktop pass confirmed tilt (`transform: perspective(900px) rotateY(...)`) coexists with `translate`/`scale`/`opacity`; a `reducedMotion: reduce` context rendered all cards at computed `opacity 1` with no inline styles. No console errors or page errors in any pass.

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

Baseline for any resume is the latest release commit on `main` — currently the 1.2.0 release, whose Pages build is the live site. This file was created with 1.1.0; there is no earlier handoff to reconcile.

Known gaps, none of them blockers:

- Only headless Chrome was used. Physical iOS Safari has not been tested, and 1.2.0 depends on it most: the zoom guards exist precisely because iOS ignores `user-scalable=no`, and the 16px input sizing targets iOS focus auto-zoom. Chrome on Android pinch blocking is likewise unverified on a device. Verify both before trusting the app-feel work.
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
