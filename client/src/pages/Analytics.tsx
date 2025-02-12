import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { QuestionAnalytics } from "@shared/schema";
import { format } from "date-fns";

export default function Analytics() {
  const { data: topQuestions, isLoading: isLoadingTop } = useQuery<QuestionAnalytics[]>({
    queryKey: ["/api/analytics/top"],
  });

  const { data: allAnalytics, isLoading: isLoadingAll } = useQuery<QuestionAnalytics[]>({
    queryKey: ["/api/analytics"],
  });

  if (isLoadingTop || isLoadingAll) {
    return <div>Loading analytics...</div>;
  }

  const categoryData = allAnalytics?.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.count;
    return acc;
  }, {} as Record<string, number>);

  const categoryChartData = Object.entries(categoryData || {}).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">Question Analytics</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topQuestions?.map((q, idx) => (
                <div key={q.id} className="border-b pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium">#{idx + 1}</span>
                      <p className="text-sm mt-1">{q.question}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-semibold">{q.count}</span>
                      <p className="text-xs text-muted-foreground">
                        Last: {format(new Date(q.lastAsked), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Questions by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
