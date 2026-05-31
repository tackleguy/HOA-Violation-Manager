"use client";

import { formatDistanceToNow } from "date-fns";
import { useOptimistic, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
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
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium">Notifications</h2>
          <p className="text-xs text-muted-foreground">{unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}</p>
        </div>
        {unreadCount > 0 ? (
          <Button variant="ghost" size="sm" disabled={isPending} onClick={handleMarkAllRead}>
            Mark all read
          </Button>
        ) : null}
      </div>
      {optimisticNotifications.length === 0 ? (
        <EmptyState title="No notifications" description="Updates about violations, requests, and team activity will appear here." />
      ) : (
        <ul className="divider-y border-t border-border/80">
          {optimisticNotifications.map((notification) => {
            const isUnread = !notification.read_at;
            return (
              <li key={notification.id}>
                <button
                  type="button"
                  className={cn(
                    "focus-ring w-full py-3 text-left transition-colors hover:bg-muted/30",
                    isUnread && "font-medium"
                  )}
                  onClick={() => {
                    if (isUnread) handleMarkRead(notification.id);
                  }}
                  disabled={isPending}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <p className={cn("text-sm", !isUnread && "text-muted-foreground")}>{notification.title}</p>
                      {notification.body ? <p className="text-sm font-normal text-muted-foreground">{notification.body}</p> : null}
                    </div>
                    {isUnread ? <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" aria-hidden /> : null}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
