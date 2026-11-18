# Security notes

TableTamer is a browser-only CSV tool. All table data stays in the user's
browser (`localStorage`, key `tableTamerData`); nothing is uploaded. The Express
server only serves the built static client and a `/healthz` check — there is no
API, database, authentication or user data on the server.

Hardening in place:

- CSV export escapes cells starting with `= + - @` (`escapeFormulae`) so a
  crafted CSV cannot run as a formula when the export is opened in a spreadsheet.
- PapaParse does not coerce values on load, so no silent data change.
- `helmet` sets security headers; `x-powered-by` is off; the server binds to
  `127.0.0.1` behind nginx.
- `npm audit` runs in CI and fails the job on a production **critical** advisory.

The earlier Replit-specific audit notes were removed with the Replit template
code (user storage, Drizzle schema, Passport) during the 2026-11-18 audit.
