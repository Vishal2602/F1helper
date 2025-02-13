import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2 } from "lucide-react";
import { MascotAvatar } from "./MascotAvatar";
import { detectIntent } from "@/lib/dialogflow-service";
import { getAIResponse } from "@/lib/openai-service";
import { QuestionCategories } from "./QuestionCategories";
import { apiRequest } from "@/lib/queryClient";
import { nanoid } from "nanoid";
import { QAResponse } from "@shared/schema";

type Message = {
  isUser: boolean;
  text: string;
};

type PDFSearchResponse = {
  content?: string;
  relevance?: number;
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

  const handleCategorySelect = async (category: string) => {
    setCurrentEmotion("thinking");
    setIsLoading(true);

    try {
      // Get questions for the selected category
      const response = await apiRequest<QAResponse[]>("GET", `/api/qa/${category}`);
      const questions = response.map(qa => qa.question).join("\n");

      const prompt = `Here are some common questions about ${category}:\n${questions}\nWhat specific question do you have about this topic?`;

      setMessages(prev => [...prev, { isUser: false, text: prompt }]);
      setCurrentEmotion("happy");
    } catch (error) {
      console.error("Error fetching category questions:", error);
      setCurrentEmotion("confused");
      setMessages(prev => [...prev, {
        isUser: false,
        text: "I had trouble loading questions for that category. Please try asking your question directly."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { isUser: true, text: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
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
        try {
          // Search PDF content for relevant information
          const pdfSearchResponse = await apiRequest<PDFSearchResponse>("POST", "/api/pdf/search", {
            query: input.trim()
          });

          if (pdfSearchResponse?.content) {
            response = await getAIResponse(input.trim(), pdfSearchResponse.content);
          } else {
            response = await getAIResponse(input.trim());
          }

          // Set emotion based on response
          setCurrentEmotion("happy");
        } catch (error) {
          console.error("Error with AI services:", error);
          // Fallback to PDF search only if AI services fail
          try {
            const pdfSearchResponse = await apiRequest<PDFSearchResponse>("POST", "/api/pdf/search", {
              query: input.trim()
            });

            if (pdfSearchResponse?.content) {
              response = `Based on our F1 visa guide: ${pdfSearchResponse.content}`;
            } else {
              response = "I apologize, but I couldn't find a specific answer to your question. Please try rephrasing or ask about a different topic.";
            }
            setCurrentEmotion("neutral");
          } catch (searchError) {
            console.error("Error with PDF search:", searchError);
            response = "I apologize, but I'm having trouble accessing my knowledge base right now. Please try again in a moment.";
            setCurrentEmotion("confused");
          }
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
        <QuestionCategories onSelectCategory={handleCategorySelect} />
        <ScrollArea className="flex-1 pr-4 -mr-4 mt-4">
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