import { expect, test, type Page } from "@playwright/test";

// `npm run test:e2e:live` runs the same suite against the public site, which
// sits behind nginx and Cloudflare. Those layers differ from the bare app in
// known ways, handled explicitly below.
const LIVE = process.env.TABLETAMER_BASE_URL !== undefined;

// Cloudflare Web Analytics injects its beacon at the edge; the app's CSP
// (script-src 'self') blocks it. That is CDN noise, not an app error.
const IGNORED_ERRORS = [/static\.cloudflareinsights\.com/];

// Collect console errors and uncaught exceptions for the whole page lifetime.
function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(err.message));
  return errors;
}

function appErrors(errors: string[]): string[] {
  return errors.filter((e) => !IGNORED_ERRORS.some((re) => re.test(e)));
}

test("health check answers", async ({ request }) => {
  const res = await request.get("/healthz");
  if (LIVE) {
    // Public /healthz is answered by nginx itself with 204.
    expect([200, 204]).toContain(res.status());
    return;
  }
  expect(res.status()).toBe(200);
  expect(await res.json()).toEqual({ status: "ok", service: "tabletamer" });
});

test("app shell loads with security headers and no console errors", async ({ page }) => {
  const errors = watchErrors(page);
  const res = await page.goto("/");
  expect(res?.status()).toBe(200);

  const headers = res?.headers() ?? {};
  expect(headers["content-security-policy"]).toContain("default-src 'self'");
  expect(headers["content-security-policy"]).toContain("script-src 'self'");
  expect(headers["x-content-type-options"]).toContain("nosniff");
  expect(headers["x-powered-by"]).toBeUndefined();
  expect(headers["cache-control"]).toBe("no-cache");

  await expect(page).toHaveTitle("TableTamer");
  await expect(page.getByRole("heading", { name: "Welcome to TableTamer" })).toBeVisible();
  // Header icons render (the GitHub mark is a local icon since lucide-react 1.x).
  await expect(page.getByRole("button", { name: "View on GitHub" }).locator("svg")).toBeVisible();
  await expect(page.getByRole("button", { name: "Toggle theme" }).locator("svg")).toHaveCount(2);
  expect(appErrors(errors)).toEqual([]);
});

test("security headers are sent once", async ({ request }) => {
  // TT-11 regression guard: nginx must not repeat headers helmet already
  // sends (fixed on piapps 2026-11-20 by removing the vhost's add_header lines).
  const res = await request.get("/");
  const names = res.headersArray().map((h) => h.name.toLowerCase());
  for (const name of ["x-content-type-options", "x-frame-options", "x-xss-protection"]) {
    expect(
      names.filter((n) => n === name),
      name,
    ).toHaveLength(1);
  }
});

test("example data renders a searchable table", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/");
  await page.getByRole("button", { name: /try with example data/i }).click();

  const table = page.locator("table");
  await expect(table).toBeVisible();
  await expect(table.locator("thead")).toContainText("first_name");
  await expect(table.locator("tbody tr").first()).toBeVisible();

  await page.getByPlaceholder("Search data...").fill("example42@example.com");
  await expect(table.locator("tbody tr")).toHaveCount(1);
  await expect(table.locator("tbody")).toContainText("example42@example.com");
  expect(appErrors(errors)).toEqual([]);
});

test("uploaded CSV keeps raw values (no coercion)", async ({ page }) => {
  await page.goto("/");
  await page.locator("#fileInput").setInputFiles({
    name: "smoke.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("zip,code,flag\n00123,1e3,TRUE\n04567,12345678901234567890,FALSE\n"),
  });

  const body = page.locator("table tbody");
  await expect(body.locator("tr")).toHaveCount(2);
  await expect(body).toContainText("00123");
  await expect(body).toContainText("1e3");
  await expect(body).toContainText("12345678901234567890");
});

test("unknown API and asset paths 404 instead of the SPA shell", async ({ request }) => {
  const api = await request.get("/api/nope");
  expect(api.status()).toBe(404);
  expect(await api.json()).toEqual({ error: "Not found" });

  const asset = await request.get("/assets/does-not-exist.js");
  expect(asset.status()).toBe(404);
});
