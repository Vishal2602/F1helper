import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Book,
  Briefcase,
  Plane,
  GraduationCap,
  Heart,
  FileText
} from "lucide-react";

const categories = [
  { id: "academic", label: "Academic Requirements", icon: Book },
  { id: "work", label: "Work Permits (CPT/OPT)", icon: Briefcase },
  { id: "travel", label: "Travel & Visa", icon: Plane },
  { id: "status", label: "Status Maintenance", icon: GraduationCap },
  { id: "health", label: "Health Insurance", icon: Heart },
  { id: "documents", label: "Documents & Forms", icon: FileText },
];

interface QuestionCategoriesProps {
  onSelectCategory: (category: string) => void;
}

export function QuestionCategories({ onSelectCategory }: QuestionCategoriesProps) {
  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-3">Common Question Categories</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {categories.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant="outline"
            className="flex items-center gap-2 w-full"
            onClick={() => onSelectCategory(id)}
          >
            <Icon className="h-4 w-4" />
            <span className="text-sm">{label}</span>
          </Button>
        ))}
      </div>
    </Card>
  );
}
