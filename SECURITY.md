# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.2.x   | :white_check_mark: |
| < 1.2   | :x:                |

## Reporting a Vulnerability

Please do **not** open a public GitHub issue for a security problem (for
example CSV formula injection in exports, XSS through cell content, CSP or
header regressions).

Report it privately through GitHub Security Advisories
(**Security → Advisories → Report a vulnerability**) or by email to
`zk@hexawulf.dev`. Include:

- A description of the problem and its impact
- Steps to reproduce, a sample CSV or a proof of concept
- The TableTamer version and your browser / Node.js version

You can expect an acknowledgement within 72 hours.

## Security Architecture

- **Browser-only data:** CSV data is parsed and kept in the browser
  (`localStorage`, key `tableTamerData`). Nothing is uploaded; the server has
  no API, database or user accounts.
- **Minimal server:** Express serves the built static client and `/healthz`
  only, binds to `127.0.0.1` behind nginx, and returns 404 for every `/api/*`
  path.
- **Strict headers:** `helmet` sets the Content Security Policy and security
  headers in production; a Playwright smoke test checks them against the
  production build in CI.
- **Safe export:** cells starting with `= + - @` are escaped on CSV export.
- **Supply chain:** GitHub Actions are pinned to commit SHAs and kept current
  by Dependabot; `npm audit` runs in CI.

See [SECURITY_AUDIT.md](SECURITY_AUDIT.md) for the audit notes.
