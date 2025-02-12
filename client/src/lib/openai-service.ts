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

Keep responses concise, friendly and conversational. If a question is outside F1 visa scope, politely redirect to appropriate resources.`;

function getFallbackResponse(question: string): string {
  const fallbackResponses = [
    "Based on USCIS guidelines, F1 students must maintain full-time enrollment during academic terms. For specific requirements at your institution, please consult your DSO.",
    "According to F1 visa regulations, students can work up to 20 hours per week on-campus during academic terms. For off-campus work authorization, you'll need to apply for CPT or OPT through your DSO.",
    "For international travel, make sure your I-20 is signed, your visa is valid, and your passport has at least 6 months validity. Contact your DSO before planning any trips.",
    "I'd recommend scheduling an appointment with your DSO to discuss this in detail. They can provide guidance specific to your situation.",
  ];

  return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
}

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

    if (error.error?.type === "insufficient_quota") {
      return "I apologize, but our AI service is currently unavailable. Here's some general guidance:\n\n" + getFallbackResponse(question);
    }

    return "I apologize for the inconvenience. Our systems are currently experiencing high demand. Please try again in a few moments or contact your DSO for immediate assistance.";
  }
}