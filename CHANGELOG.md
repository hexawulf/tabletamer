# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2026-11-20

Dependency majors from Dependabot (#13–#16), reviewed and fixed by hand.

### Changed

- **Tailwind CSS 3 → 4.3** (supersedes #13) with **tailwind-merge 3** (supersedes
  #15; v3 targets Tailwind 4 only). CSS-first config in `client/src/index.css`
  (`tailwind.config.ts` removed), `@tailwindcss/postcss` replaces
  `tailwindcss` + `autoprefixer`, `tw-animate-css` replaces the unmaintained
  `tailwindcss-animate`. Kept the v3 look on purpose: v3 sans font stack, button
  `cursor: pointer`, gray-400 placeholders, v3 border colour. Checked against
  v3 with pixel diffs of 14 UI states (light/dark × empty, table, cell edit,
  columns, export, shortcuts, about) at 1280 and 768 px: identical.
- **Express 4 → 5.3** (supersedes #16): path-to-regexp v8 wildcard syntax
  (`/api/{*splat}`, `/assets/{*splat}`, SPA fallback without `"*"`); routing is
  unchanged. Production `npm audit` is now 0 (the `qs` advisories are gone).
- **lucide-react 0.453 → 1.74** (supersedes #14): brand icons were removed in 1.x,
  so the header GitHub icon is now a local `GithubIcon` with the same paths.
- 18 minor/patch updates (#12), incl. Playwright 1.65, esbuild 0.28, Radix,
  helmet 8.3, papaparse 5.7.

### Fixed

- Footer and About showed a hardcoded, stale version (v1.1.2). The version
  now comes from `package.json` at build time (`__APP_VERSION__`).
- The upgrade tool turned the pagination Button `variant="outline"` into
  `"outline-solid"`; reverted (caught by `tsc`).
- Empty state: removed a `mt-4` that v4's `space-y` would have added on top of
  the 24 px gap. Footer links use `gap-x-4`, so a wrapped line on phones is no
  longer indented.

## [1.2.1] - 2026-11-20

### Fixed

- TT-11: the public site no longer sends `X-Content-Type-Options`,
  `X-Frame-Options` and `X-XSS-Protection` twice. The duplicates came from the
  piapps nginx vhost (now removed); helmet's single copies remain
  (`X-XSS-Protection: 0`). The live e2e run no longer expects this test to fail.

## [1.2.0] - 2026-11-20

### Added

- Playwright smoke test (`npm run test:e2e`, 6 tests, headless Chromium)
  against the production build (`node dist/index.js`): health check, CSP and
  security headers, example data + search, CSV upload without value coercion,
  `/api/*` and missing `/assets/*` 404s. Runs as its own CI job.
  `npm run test:e2e:live` runs the same suite against tabletamer.piapps.dev.
- `.github/dependabot.yml`: weekly npm (minor/patch grouped) and
  GitHub Actions updates.
- `SECURITY.md`: supported versions, private reporting, security architecture.

### Changed

- CI: all actions pinned to full commit SHAs on their Node 24 releases
  (checkout v7.0.1, setup-node v7.1.0, upload-artifact v7.0.2);
  `permissions: contents: read`, `persist-credentials: false`, concurrency
  cancel, job timeouts; audit job on Node 24.

### Known issues

- TT-11: the piapps nginx vhost repeats headers helmet already sends
  (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`). Fixed
  in 1.2.1.

## [1.1.2] - 2026-11-18

### Removed

- Unused server dependencies `cors` and `express-rate-limit` (and `@types/cors`).
  The server stopped importing them in 1.1.0 (TT-09). No change in behaviour.

### Docs

- README: health check and deploy verification steps.

## [1.1.1] - 2026-11-18

### Fixed

- The server did not start listening under pm2 (v1.1.0 regression from TT-09):
  the "run directly" check compared `import.meta.url` with `process.argv[1]`,
  which is pm2's wrapper script. It now starts unless Vitest imports it.

## [1.1.0] - 2026-11-18

Audit 2026-11-18 (findings TT-01…TT-10).

### Fixed

- Loading a large CSV no longer crashes the app when browser storage is full;
  the table stays usable and a toast explains it will not be restored (TT-01).
- CSV values are no longer silently coerced on load (leading zeros, long IDs,
  `1e3`, `TRUE` are preserved); export round-trips unchanged (TT-02).
- Rows with a different number of fields are loaded with a warning instead of
  rejecting the whole file (TT-03).
- Sorting is type-aware and stable; empty cells always sort last; slash dates
  are read day-first (TT-04).
- An edited cell keeps its place until the next sort (TT-08).
- CSV export escapes cells starting with `= + - @` so spreadsheets do not run
  them as formulas (TT-08).
- Dark-mode and export keyboard shortcuts moved off Ctrl+D / Ctrl+E (TT-10).

### Changed

- Server: dropped CORS, the no-op API rate limiter and the request logger;
  `/api/*` returns a JSON 404; binds `127.0.0.1`; `x-powered-by` off (TT-09).
- Tooling: ESLint flat config, Vitest tests, CI on Node 22 and 24 (TT-05).

### Removed

- Unused server/auth/DB packages and dead files (Replit template leftovers),
  unused shadcn UI components (TT-06, TT-07).

## [1.0.0] - 2025-05-13

### Initial Release

- CSV file upload with drag-and-drop
- Table display with pagination
- Row sorting and filtering
- Column management
- Export to CSV/JSON
- Light/dark theme toggle
- Keyboard shortcuts for power users
- Inline cell editing with text transformations
- Error boundary for graceful error handling
- Local storage persistence
