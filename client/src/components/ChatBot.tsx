import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { Send } from "lucide-react";
import type { QAResponse } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function ChatBot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Array<{ isUser: boolean; text: string }>>([
    { isUser: false, text: "Hi! I'm your F1 visa assistant. How can I help you today?" }
  ]);

  const { data: qaResponses } = useQuery<QAResponse[]>({
    queryKey: ["/api/qa"]
  });

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { isUser: true, text: input };
    setMessages(prev => [...prev, userMessage]);

    // Simple matching against predefined Q&A
    const match = qaResponses?.find(qa => 
      qa.question.toLowerCase().includes(input.toLowerCase()) ||
      input.toLowerCase().includes(qa.question.toLowerCase())
    );

    if (match) {
      // Track the question
      await apiRequest("POST", "/api/analytics/track", {
        question: match.question,
        category: match.category
      });
    }

    const botResponse = {
      isUser: false,
      text: match?.answer || "I'm not sure about that. Please contact your DSO for specific guidance."
    };

    setTimeout(() => {
      setMessages(prev => [...prev, botResponse]);
    }, 500);

    setInput("");
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
            placeholder="Type your question..."
            onKeyPress={e => e.key === "Enter" && handleSend()}
          />
          <Button onClick={handleSend}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}