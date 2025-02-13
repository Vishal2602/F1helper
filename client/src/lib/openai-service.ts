import OpenAI from "openai";

let openai: OpenAI | null = null;

async function initializeOpenAI() {
  if (!openai) {
    try {
      const response = await fetch("/api/config/xai");
      if (!response.ok) {
        throw new Error(`Failed to fetch config: ${response.statusText}`);
      }

      const config = await response.json();
      if (!config.xaiKey) {
        throw new Error("xAI API key not found in server config");
      }

      openai = new OpenAI({
        apiKey: config.xaiKey,
        dangerouslyAllowBrowser: true
      });

    } catch (error) {
      console.error("OpenAI initialization error:", error);
      openai = null;
      throw error;
    }
  }
  return openai;
}

const SYSTEM_PROMPT = `You are a helpful and friendly F1 visa expert assistant. Your responses should be conversational and empathetic while maintaining accuracy. Use your knowledge of F1 visa regulations and requirements to help international students.

Key areas to focus on:
- Academic requirements and maintaining status
- Work authorization (CPT/OPT)
- Travel regulations
- Visa interviews and application process
- Health insurance requirements
- Program extensions and transfers

Keep responses friendly but professional. If you're not completely sure about something, recommend consulting with a DSO for official guidance.

Example responses:
"That's a great question about CPT! Let me explain how it works..."
"I understand you're concerned about maintaining your status. Here's what you need to know..."
"While I can give you general guidance about OPT, your specific case might have unique factors. I'd recommend discussing this with your DSO to ensure you have the most accurate information for your situation."`;

export async function getAIResponse(question: string, context?: string): Promise<string> {
  try {
    const client = await initializeOpenAI();

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "system", content: "Use this additional context from the F1 visa helper document if relevant: " + (context || "") }
    ];

    // Add the user's question
    messages.push({ role: "user", content: question });

    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 500
    });

    return response.choices[0].message.content || "I apologize, but I couldn't generate a response. Please try rephrasing your question.";
  } catch (error: any) {
    console.error("Error getting AI response:", error);

    if (error.message.includes("API key")) {
      return "I apologize, but there seems to be an issue with the AI service configuration. Please try again later.";
    }

    if (error.message.includes("quota") || error.message.includes("rate limit")) {
      return "I apologize, but the AI service is temporarily unavailable due to high demand. Please try again in a few moments.";
    }

    return "I apologize, but I'm having trouble processing your request right now. Please try again or rephrase your question.";
  }
}