import OpenAI from "openai";
import { apiRequest } from "./queryClient";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
let openai: OpenAI | null = null;

async function initializeOpenAI() {
  if (!openai) {
    try {
      const response = await fetch("/api/config");
      const config = await response.json();

      if (!config.openaiKey) {
        throw new Error("OpenAI API key not configured");
      }

      openai = new OpenAI({
        apiKey: config.openaiKey,
        dangerouslyAllowBrowser: true
      });
    } catch (error) {
      console.error("Failed to initialize OpenAI:", error);
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

Keep responses concise and clear. If a question is outside F1 visa scope, politely redirect to appropriate resources.`;

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
  } catch (error) {
    console.error("Error getting AI response:", error);
    return "I'm currently having trouble processing your request. Please try again later or contact your DSO for immediate assistance.";
  }
}