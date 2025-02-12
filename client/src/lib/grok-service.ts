import OpenAI from "openai";

// Initialize xAI client
let xai: OpenAI | null = null;

async function initializeXAI() {
  if (!xai) {
    try {
      const response = await fetch("/api/config/xai");
      if (!response.ok) {
        throw new Error(`Failed to fetch xAI config: ${response.statusText}`);
      }

      const config = await response.json();
      if (!config.xaiKey) {
        throw new Error("xAI API key not found in server config");
      }

      xai = new OpenAI({
        baseURL: "https://api.x.ai/v1",
        apiKey: config.xaiKey,
        dangerouslyAllowBrowser: true
      });

    } catch (error) {
      console.error("xAI initialization error:", error);
      xai = null;
      throw error;
    }
  }
  return xai;
}

const SYSTEM_PROMPT = `You are an F1 visa expert assistant. Provide accurate, helpful information about F1 visa rules, regulations, and requirements. Always include relevant citations or references to official USCIS guidelines when possible. If unsure, recommend consulting with a DSO.

Key areas of expertise:
- Academic requirements
- Work authorization (CPT/OPT)
- Travel regulations
- Visa status maintenance

Keep responses concise, friendly and conversational. If a question is outside F1 visa scope, politely redirect to appropriate resources.`;

export async function getGrokResponse(question: string): Promise<string> {
  try {
    const client = await initializeXAI();

    const response = await client.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: question }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return response.choices[0].message.content || "I apologize, but I couldn't generate a response. Please try rephrasing your question.";
  } catch (error: any) {
    console.error("Error getting Grok response:", error);
    throw new Error("Failed to get response from Grok: " + error.message);
  }
}
