import OpenAI from "openai";
import { apiRequest } from "./queryClient";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
let openai: OpenAI | null = null;

async function initializeOpenAI() {
  if (!openai) {
    try {
      const response = await fetch("/api/config");
      if (!response.ok) {
        throw new Error(`Failed to fetch config: ${response.statusText}`);
      }

      const config = await response.json();
      if (!config.openaiKey) {
        throw new Error("OpenAI API key not found in server config");
      }

      openai = new OpenAI({
        apiKey: config.openaiKey,
        dangerouslyAllowBrowser: true
      });

      // Test the connection
      await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "system", content: "Test connection" }],
        max_tokens: 5
      });
    } catch (error) {
      console.error("OpenAI initialization error:", error);
      openai = null;
      throw error;
    }
  }
  return openai;
}

const SYSTEM_PROMPT = `You are an F1 visa expert assistant. Provide accurate, helpful information about F1 visa rules, regulations, and requirements. Always include relevant citations or references to official USCIS guidelines when possible. If unsure, recommend consulting with a DSO.

Key areas of expertise:
- Academic requirements
- Work authorization (CPT/OPT)
- Travel regulations
- Visa status maintenance

Keep responses concise, friendly and conversational. If a question is outside F1 visa scope, politely redirect to appropriate resources.`;

export async function getAIResponse(question: string): Promise<string> {
  try {
    const client = await initializeOpenAI();

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: question }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return response.choices[0].message.content || "I apologize, but I couldn't generate a response. Please try rephrasing your question.";
  } catch (error: any) {
    console.error("Error getting AI response:", error);

    // Check for specific OpenAI API errors
    const errorMessage = error?.error?.message || error?.message || "";

    if (errorMessage.includes("API key")) {
      return "I apologize, but there seems to be an issue with the AI service configuration. Please try again later.";
    }

    if (errorMessage.includes("quota") || errorMessage.includes("rate limit")) {
      return "I apologize, but the AI service is temporarily unavailable due to high demand. Please try again in a few moments.";
    }

    return "I apologize, but I'm having trouble processing your request right now. Please try again or rephrase your question.";
  }
}