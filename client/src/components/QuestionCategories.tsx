import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
import { QAResponse } from "@shared/schema";
import { CATEGORY_LABELS } from "../../../server/services/pdf-processor";
import { Book, Briefcase, GraduationCap, Plane, Heart, Calendar } from "lucide-react";

const categoryIcons = {
  status_maintenance: Book,
  employment: Briefcase,
  academic: GraduationCap,
  travel: Plane,
  health_insurance: Heart,
  program_extension: Calendar,
};

interface QuestionCategoriesProps {
  onQuestionSelect: (question: string) => void;
}

export function QuestionCategories({ onQuestionSelect }: QuestionCategoriesProps) {
  const { data: qaList } = useQuery<QAResponse[]>({
    queryKey: ["/api/qa"],
  });

  const questionsByCategory = qaList?.reduce((acc, qa) => {
    if (!acc[qa.category]) {
      acc[qa.category] = [];
    }
    acc[qa.category].push(qa);
    return acc;
  }, {} as Record<string, QAResponse[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Question Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {Object.entries(CATEGORY_LABELS).map(([category, label]) => {
            const Icon = categoryIcons[category as keyof typeof categoryIcons];
            return (
              <AccordionItem key={category} value={category}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-2 pt-2">
                    {questionsByCategory?.[category]?.map((qa, idx) => (
                      <Button
                        key={idx}
                        variant="ghost"
                        className="justify-start text-left"
                        onClick={() => onQuestionSelect(qa.question)}
                      >
                        {qa.question}
                      </Button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
