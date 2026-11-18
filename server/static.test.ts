// @vitest-environment node
// TT-09: server behaviour — /api/* JSON 404, asset cache headers, missing asset
// 404, HTML no-cache. Uses a fixture dist/public so it does not need a build.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import fs from "fs";
import path from "path";
import { createApp } from "./index";
import { serveStatic } from "./vite";

const distPublic = path.resolve(import.meta.dirname, "public");
const assetsDir = path.join(distPublic, "assets");
const FIXTURE_ASSET = "app-fixture.js";
let createdPublic = false;
let createdAssets = false;
let createdIndex = false;
let createdAsset = false;

function buildTestApp() {
  const app = createApp();
  app.all("/api/*", (_req, res) => res.status(404).json({ error: "Not found" }));
  app.get("/healthz", (_req, res) => res.status(200).json({ status: "ok" }));
  serveStatic(app);
  return app;
}

beforeAll(() => {
  if (!fs.existsSync(distPublic)) {
    createdPublic = true;
    fs.mkdirSync(distPublic, { recursive: true });
  }
  if (!fs.existsSync(assetsDir)) {
    createdAssets = true;
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  const indexPath = path.join(distPublic, "index.html");
  if (!fs.existsSync(indexPath)) {
    createdIndex = true;
    fs.writeFileSync(indexPath, "<!doctype html><title>tabletamer</title>");
  }
  const assetPath = path.join(assetsDir, FIXTURE_ASSET);
  if (!fs.existsSync(assetPath)) {
    createdAsset = true;
    fs.writeFileSync(assetPath, "console.log(1);");
  }
});

afterAll(() => {
  if (createdAsset) fs.rmSync(path.join(assetsDir, FIXTURE_ASSET), { force: true });
  if (createdIndex) fs.rmSync(path.join(distPublic, "index.html"), { force: true });
  if (createdAssets) fs.rmSync(assetsDir, { recursive: true, force: true });
  if (createdPublic) fs.rmSync(distPublic, { recursive: true, force: true });
});

describe("TT-09: server", () => {
  let built: ReturnType<typeof buildTestApp>;
  beforeAll(() => {
    built = buildTestApp();
  });

  it("GET /api/anything -> JSON 404", async () => {
    const res = await request(built).get("/api/session/properties");
    expect(res.status).toBe(404);
    expect(res.headers["content-type"]).toMatch(/json/);
  });

  it("GET /healthz -> 200", async () => {
    const res = await request(built).get("/healthz");
    expect(res.status).toBe(200);
  });

  it("a hashed asset is immutable + long cached", async () => {
    const res = await request(built).get(`/assets/${FIXTURE_ASSET}`);
    expect(res.status).toBe(200);
    expect(res.headers["cache-control"]).toMatch(/immutable/);
    expect(res.headers["cache-control"]).toMatch(/max-age=31536000/);
  });

  it("a missing asset -> plain 404, not the SPA", async () => {
    const res = await request(built).get("/assets/missing.js");
    expect(res.status).toBe(404);
    expect(res.headers["content-type"]).toMatch(/text\/plain/);
  });

  it("the HTML shell is no-cache", async () => {
    const res = await request(built).get("/some/spa/route");
    expect(res.status).toBe(200);
    expect(res.headers["cache-control"]).toMatch(/no-cache/);
  });

  it("x-powered-by is disabled", async () => {
    const res = await request(built).get("/healthz");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });
});
