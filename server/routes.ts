import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";

export function registerRoutes(app: Express) {
  app.get("/api/config", (_req, res) => {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        message: "OpenAI API key not configured"
      });
    }

    // Only send the API key if it's properly configured
    res.json({
      openaiKey: apiKey
    });
  });

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

  app.get("/api/analytics", async (_req, res) => {
    const analytics = await storage.getQuestionAnalytics();
    res.json(analytics);
  });

  app.get("/api/analytics/top", async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const topQuestions = await storage.getTopQuestions(limit);
    res.json(topQuestions);
  });

  app.post("/api/analytics/track", async (req, res) => {
    const { question, category } = req.body;
    await storage.trackQuestion(question, category);
    res.json({ success: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}