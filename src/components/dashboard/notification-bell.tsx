"use client";

import { Bell, CheckCheck } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type NotificationBellItem = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  time: string;
};

type NotificationBellProps = {
  notifications: NotificationBellItem[];
  unreadCount: number;
  markReadAction: (formData: FormData) => Promise<void>;
  markAllReadAction: (formData: FormData) => Promise<void>;
};

export function NotificationBell({ notifications, unreadCount, markReadAction, markAllReadAction }: NotificationBellProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticNotifications, markRead] = useOptimistic(notifications, (state, notificationId: string | "all") => {
    if (notificationId === "all") {
      return state.map((notification) => ({ ...notification, read: true }));
    }
    return state.map((notification) => (notification.id === notificationId ? { ...notification, read: true } : notification));
  });

  const unread = optimisticNotifications.filter((notification) => !notification.read).length;

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Notifications" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unread > 0 ? (
            <Button variant="ghost" size="sm" className="h-7 px-2" disabled={isPending} onClick={handleMarkAllRead}>
              <CheckCheck className="mr-1 h-3.5 w-3.5" />
              Mark all
            </Button>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {optimisticNotifications.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">No notifications yet.</p>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {optimisticNotifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                className={cn(
                  "focus-ring w-full px-3 py-3 text-left transition-colors hover:bg-muted/50",
                  !notification.read && "bg-primary/5"
                )}
                onClick={() => {
                  if (!notification.read) handleMarkRead(notification.id);
                }}
                disabled={isPending}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={cn("text-sm", !notification.read ? "font-medium" : "text-muted-foreground")}>{notification.title}</p>
                    {notification.body ? <p className="mt-1 text-xs text-muted-foreground">{notification.body}</p> : null}
                    <p className="mt-1 text-xs text-muted-foreground">{notification.time}</p>
                  </div>
                  {!notification.read ? <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" /> : null}
                </div>
              </button>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
