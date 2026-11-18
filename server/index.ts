import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import helmet from "helmet";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import logger from "./src/logger";

logger.info("✅ Winston logger initialized – startup check");

export function createApp() {
  const app = express();

  // Behind nginx. No cookies/sessions, so trust proxy is only for correct
  // client IPs in logs/errors.
  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  // Compression (level 6 is a good balance on a Pi).
  app.use(compression({ level: 6, threshold: 1024 }));

  // Security headers. TT-09 dropped CORS and the no-op /api rate limiter: this
  // app has no API, so both were dead surface area.
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
      crossOriginEmbedderPolicy: false, // allow Vite HMR in dev
    }),
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: false }));

  return app;
}

export async function buildServer() {
  const app = createApp();
  const server = await registerRoutes(app);

  // TT-09: there is no API. Any /api/* path gets a JSON 404 instead of falling
  // through to the SPA shell with a 200.
  app.all("/api/*", (_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const e = err as { status?: number; statusCode?: number; message?: string; stack?: string };
    const status = e.status || e.statusCode || 500;
    const message = e.message || "Internal Server Error";
    logger.error("Unhandled request error", { status, message, stack: e.stack });
    res.status(status).json({ message });
  });

  // Only set up Vite in development, and after the API 404 so the catch-all
  // SPA route does not shadow it.
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  return server;
}

// Start only when run directly, so tests can import buildServer/createApp.
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  buildServer()
    .then((server) => {
      const port = Number(process.env.PORT || 5000);
      const host = process.env.HOST || "127.0.0.1";
      server.listen({ port, host }, () => {
        log(`serving on ${host}:${port}`);
      });
    })
    .catch((error) => {
      logger.error("Failed to start server", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      process.exit(1);
    });
}
