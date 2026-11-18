import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/healthz", (_req, res) => {
    res.status(200).json({ status: "ok", service: "tabletamer" });
  });

  const httpServer = createServer(app);

  return httpServer;
}
