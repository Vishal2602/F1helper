import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Notification } from "@shared/schema";
import { format } from "date-fns";

export function NotificationBoard() {
  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"]
  });

  if (isLoading) {
    return <div>Loading notifications...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Important Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {notifications?.map(notification => (
          <Card key={notification.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold">{notification.title}</h3>
                <Badge
                  variant={notification.priority === "high" ? "destructive" : "secondary"}
                >
                  {notification.priority}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{notification.content}</p>
              <time className="text-xs text-muted-foreground">
                {format(new Date(notification.date), "MMM d, yyyy")}
              </time>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
