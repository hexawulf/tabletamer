import { defineConfig, devices } from "@playwright/test";

/**
 * Lightweight browser smoke test against the **production build**
 * (`node dist/index.js`, NODE_ENV=production), not the Vite dev server: helmet's
 * CSP and the cache headers only exist in production, so a CSP mistake that
 * blanks the app must fail here.
 *
 * TABLETAMER_BASE_URL points the suite at an already-running server and turns
 * off the local webServer (post-deploy check: `npm run test:e2e:live`).
 */
const PORT = 5097;
const BASE_URL = process.env.TABLETAMER_BASE_URL ?? `http://127.0.0.1:${String(PORT)}`;
const OWN_SERVER = process.env.TABLETAMER_BASE_URL === undefined;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: process.env.CI !== undefined,
  retries: 0,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI === undefined ? "list" : [["github"], ["list"]],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  ...(OWN_SERVER
    ? {
        webServer: {
          // CI builds in its own step and only starts the server. Locally we
          // always rebuild first so the suite can never pass on a stale dist/.
          command: `${process.env.CI === undefined ? "npm run build && " : ""}node dist/index.js`,
          url: `${BASE_URL}/healthz`,
          reuseExistingServer: false,
          timeout: 180_000,
          env: {
            NODE_ENV: "production",
            HOST: "127.0.0.1",
            PORT: String(PORT),
            LOG_FILE_PATH: "test-results/tabletamer-e2e.log",
          },
        },
      }
    : {}),
});
