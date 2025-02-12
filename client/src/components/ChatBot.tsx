import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2 } from "lucide-react";
import { MascotAvatar } from "./MascotAvatar";
import { detectIntent } from "@/lib/dialogflow-service";
import { getGrokResponse } from "@/lib/grok-service";
import { nanoid } from "nanoid";

type Message = {
  isUser: boolean;
  text: string;
};

export function ChatBot() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => nanoid());
  const [currentEmotion, setCurrentEmotion] = useState<
    "neutral" | "happy" | "thinking" | "confused"
  >("happy");
  const [messages, setMessages] = useState<Message[]>([
    {
      isUser: false,
      text: "Hi! I'm your friendly F1 visa assistant. How can I help you today? Feel free to ask me anything about F1 visa requirements, work permits, or academic regulations."
    }
  ]);

  // Helper function to check for greeting patterns
  const isGreeting = (text: string): boolean => {
    const greetingPatterns = [
      /^hi\b/i,
      /^hello\b/i,
      /^hey\b/i,
      /^greetings/i,
      /^good\s*(morning|afternoon|evening)/i,
      /^howdy\b/i,
    ];
    return greetingPatterns.some(pattern => pattern.test(text.trim()));
  };

  // Helper function to get random greeting response
  const getGreetingResponse = (): string => {
    const responses = [
      "Hello! How can I assist you with your F1 visa questions today?",
      "Hi there! I'm here to help with any F1 visa related questions you might have.",
      "Greetings! What would you like to know about F1 visa regulations?",
      "Hello! I'm your F1 visa assistant. What questions do you have about studying in the US?",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { isUser: true, text: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setCurrentEmotion("thinking");

    // Show typing indicator immediately
    setMessages(prev => [...prev, { isUser: false, text: "..." }]);

    try {
      let response: string;

      // First check if it's a greeting
      if (isGreeting(input.trim())) {
        response = getGreetingResponse();
        setCurrentEmotion("happy");
      } else {
        // First try to detect intent with Dialogflow
        const dialogflowResponse = await detectIntent(input.trim(), sessionId);

        // Use Grok to generate a natural response
        let contextPrompt = "";
        if (dialogflowResponse.intent) {
          contextPrompt = `The user is asking about ${dialogflowResponse.intent}. `;
        }

        response = await getGrokResponse(input.trim(), contextPrompt);

        // Set emotion based on confidence
        if (dialogflowResponse.confidence > 0.7) {
          setCurrentEmotion("happy");
        } else {
          setCurrentEmotion("neutral");
        }
      }

      // Replace typing indicator with actual response
      setMessages(prev => [...prev.slice(0, -1), { isUser: false, text: response }]);
    } catch (error) {
      console.error("Error processing message:", error);
      setCurrentEmotion("confused");
      setMessages(prev => [...prev.slice(0, -1), {
        isUser: false,
        text: "I'm having trouble understanding that right now. Could you try rephrasing your question?"
      }]);
    } finally {
      setIsLoading(false);
      setInput("");
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <div className="relative">
            <MascotAvatar emotion={currentEmotion} />
            {isLoading && (
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping" />
            )}
          </div>
          F1 Visa Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden p-4">
        <ScrollArea className="flex-1 pr-4 -mr-4">
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] break-words ${
                    msg.isUser
                      ? "bg-primary text-primary-foreground"
                      : msg.text === "..."
                      ? "bg-muted animate-pulse"
                      : "bg-muted"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about F1 visa rules, work permits, or travel..."
            onKeyPress={e => e.key === "Enter" && handleSend()}
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={isLoading} size="icon">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}