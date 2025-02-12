import { ChatBot } from "@/components/ChatBot";
import { NotificationBoard } from "@/components/NotificationBoard";
import { Button } from "@/components/ui/button";
import { MEETING_LINKS } from "@/lib/constants";
import { Calendar, BarChart } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="container mx-auto py-8 px-4">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">F1 Visa Assistant</h1>
        <p className="text-muted-foreground">
          Get answers to your F1 visa questions and stay updated with important deadlines
        </p>
        <Link href="/analytics" className="inline-block mt-4">
          <Button variant="outline" size="sm">
            <BarChart className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
        </Link>
      </header>

      <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
        <div className="space-y-8">
          <ChatBot />
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Schedule an Appointment</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {Object.entries(MEETING_LINKS).map(([key, url]) => (
                <Button
                  key={key}
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(url, "_blank")}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {key.charAt(0).toUpperCase() + key.slice(1)} Advisor
                </Button>
              ))}
            </div>
          </div>
        </div>
        <NotificationBoard />
      </div>

      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          Disclaimer: This bot provides general guidance only. Please consult your DSO for
          official advice.
        </p>
      </footer>
    </div>
  );
}