import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { Send, Loader2, MessageCircle } from "lucide-react";
import type { QAResponse } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { detectIntent } from "@/lib/dialogflow-service";
import { detectEmotion } from "@/lib/emotion-detector";
import { MascotAvatar } from "./MascotAvatar";
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
  >("neutral");
  const [messages, setMessages] = useState<Message[]>([
    {
      isUser: false,
      text: "Hi! I'm your F1 visa assistant. I can help you with questions about academic requirements, work authorization, travel, and maintaining your visa status. What would you like to know?"
    }
  ]);

  const { data: qaResponses } = useQuery<QAResponse[]>({
    queryKey: ["/api/qa"]
  });

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { isUser: true, text: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setCurrentEmotion("thinking");

    // Show typing indicator immediately
    setMessages(prev => [...prev, { isUser: false, text: "..." }]);

    try {
      // First try Dialogflow for intent detection
      try {
        const dialogflowResponse = await detectIntent(input.trim(), sessionId);

        if (dialogflowResponse.confidence > 0.7 && dialogflowResponse.fulfillmentText) {
          // Use Dialogflow response if confidence is high
          const botResponse = dialogflowResponse.fulfillmentText;
          setCurrentEmotion(detectEmotion(botResponse));
          setMessages(prev => [...prev.slice(0, -1), { 
            isUser: false, 
            text: botResponse
          }]);

          // Track the question if we have an intent
          if (dialogflowResponse.intent) {
            await apiRequest("POST", "/api/analytics/track", {
              question: input.trim(),
              category: dialogflowResponse.intent
            });
          }
          return;
        }
      } catch (dialogflowError) {
        console.error("Dialogflow error:", dialogflowError);
        // Continue to Q&A database if Dialogflow fails
      }

      // Check our Q&A database
      const match = qaResponses?.find(qa => 
        qa.question.toLowerCase().includes(input.toLowerCase()) ||
        input.toLowerCase().includes(qa.question.toLowerCase())
      );

      let botResponse: string;

      if (match) {
        // Use predefined answer and track the question
        botResponse = match.answer;
        await apiRequest("POST", "/api/analytics/track", {
          question: match.question,
          category: match.category
        });
      } else {
        // No match found, provide a helpful default response
        botResponse = "I don't have specific information about that. To ensure you get accurate guidance, please consult with your DSO (Designated School Official) or check the USCIS website: https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors";
      }

      // Set emotion based on the response
      setCurrentEmotion(detectEmotion(botResponse));

      // Replace typing indicator with actual response
      setMessages(prev => [...prev.slice(0, -1), { isUser: false, text: botResponse }]);
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