import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { searchPDFContent } from "./services/pdf-processor";

export function registerRoutes(app: Express) {
  app.get("/api/config/xai", (_req, res) => {
    const xaiKey = process.env.XAI_API_KEY;

    if (!xaiKey) {
      return res.status(500).json({
        message: "xAI API key not configured"
      });
    }

    res.json({
      xaiKey
    });
  });

  app.get("/api/config/dialogflow", (_req, res) => {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const credentials = process.env.GOOGLE_CLOUD_CREDENTIALS;

    if (!projectId || !credentials) {
      return res.status(500).json({
        message: "Dialogflow credentials not configured"
      });
    }

    try {
      // Validate that credentials are proper JSON
      JSON.parse(credentials);

      res.json({
        projectId,
        credentials
      });
    } catch (error) {
      res.status(500).json({
        message: "Invalid Dialogflow credentials format"
      });
    }
  });

  app.post("/api/pdf/search", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) {
        return res.status(400).json({ message: "Query is required" });
      }

      const searchResult = await searchPDFContent(query);
      res.json(searchResult);
    } catch (error) {
      console.error("PDF search error:", error);
      res.status(500).json({ message: "Error searching PDF content" });
    }
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