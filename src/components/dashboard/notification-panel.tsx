"use client";

import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCheck } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export type NotificationItem = {
  id: string;
  title: string;
  body: string | null;
  read_at: string | null;
  created_at: string;
};

type NotificationPanelProps = {
  notifications: NotificationItem[];
  markReadAction: (formData: FormData) => Promise<void>;
  markAllReadAction: (formData: FormData) => Promise<void>;
  className?: string;
};

export function NotificationPanel({ notifications, markReadAction, markAllReadAction, className }: NotificationPanelProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticNotifications, markRead] = useOptimistic(notifications, (state, notificationId: string | "all") => {
    if (notificationId === "all") {
      return state.map((notification) => ({ ...notification, read_at: notification.read_at ?? new Date().toISOString() }));
    }
    return state.map((notification) =>
      notification.id === notificationId ? { ...notification, read_at: notification.read_at ?? new Date().toISOString() } : notification
    );
  });

  const unreadCount = optimisticNotifications.filter((notification) => !notification.read_at).length;

  function handleMarkRead(notificationId: string) {
    startTransition(async () => {
      markRead(notificationId);
      const formData = new FormData();
      formData.set("id", notificationId);
      await markReadAction(formData);
    });
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      markRead("all");
      await markAllReadAction(new FormData());
    });
  }

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </CardTitle>
          <CardDescription>
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
          </CardDescription>
        </div>
        {unreadCount > 0 ? (
          <Button variant="outline" size="sm" disabled={isPending} onClick={handleMarkAllRead}>
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="p-0">
        {optimisticNotifications.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={Bell} title="No notifications" description="Updates about violations, requests, and team activity will appear here." />
          </div>
        ) : (
          <ul>
            {optimisticNotifications.map((notification, index) => {
              const isUnread = !notification.read_at;
              return (
                <li key={notification.id}>
                  <button
                    type="button"
                    className={cn(
                      "focus-ring w-full px-5 py-4 text-left transition-colors hover:bg-muted/50",
                      isUnread && "bg-primary/5"
                    )}
                    onClick={() => {
                      if (isUnread) handleMarkRead(notification.id);
                    }}
                    disabled={isPending}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className={cn("text-sm", isUnread ? "font-medium" : "text-muted-foreground")}>{notification.title}</p>
                        {notification.body ? <p className="text-sm text-muted-foreground">{notification.body}</p> : null}
                      </div>
                      {isUnread ? <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden /> : null}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </button>
                  {index < optimisticNotifications.length - 1 ? <Separator /> : null}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
