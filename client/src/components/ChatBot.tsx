import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { Send, Loader2 } from "lucide-react";
import type { QAResponse } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { detectIntent } from "@/lib/dialogflow-service";
import { nanoid } from "nanoid";

export function ChatBot() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => nanoid());
  const [messages, setMessages] = useState<Array<{ isUser: boolean; text: string }>>([
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

    // Show typing indicator immediately
    setMessages(prev => [...prev, { isUser: false, text: "..." }]);

    try {
      // First try Dialogflow for intent detection
      try {
        const dialogflowResponse = await detectIntent(input.trim(), sessionId);

        if (dialogflowResponse.confidence > 0.7 && dialogflowResponse.fulfillmentText) {
          // Use Dialogflow response if confidence is high
          setMessages(prev => [...prev.slice(0, -1), { 
            isUser: false, 
            text: dialogflowResponse.fulfillmentText 
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

      // Replace typing indicator with actual response
      setMessages(prev => [...prev.slice(0, -1), { isUser: false, text: botResponse }]);
    } catch (error) {
      console.error("Error processing message:", error);
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
      <CardContent className="p-4 flex-1 flex flex-col">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
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
        <div className="flex gap-2 mt-4">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about F1 visa rules, work permits, or travel..."
            onKeyPress={e => e.key === "Enter" && handleSend()}
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={isLoading}>
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