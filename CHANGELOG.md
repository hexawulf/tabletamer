# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
