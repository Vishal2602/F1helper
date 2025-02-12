import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";

export function registerRoutes(app: Express) {
  app.get("/api/qa", async (_req, res) => {
    const qaList = await storage.getAllQA();
    res.json(qaList);
  });

  app.get("/api/qa/:category", async (req, res) => {
    const qaList = await storage.getQAByCategory(req.params.category);
    res.json(qaList);
  });

  app.get("/api/notifications", async (_req, res) => {
    const notifications = await storage.getAllNotifications();
    res.json(notifications);
  });

  const httpServer = createServer(app);
  return httpServer;
}
