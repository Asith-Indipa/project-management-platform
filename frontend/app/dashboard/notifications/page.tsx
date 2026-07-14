"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Bell, Check, Clock } from "lucide-react";

interface AppNotification {
  id: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get("/notifications");
      setNotifications(response.data);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-2 text-zinc-500">
          <Clock className="h-5 w-5 animate-pulse" />
          <span>Loading notifications...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between pb-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Notifications
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            View all your system alerts and updates in one place.
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Bell className="h-6 w-6" />
        </div>
      </div>

      <ul className="space-y-4">
        {notifications.length === 0 ? (
          <li className="px-6 py-12 text-center rounded-2xl border border-border glass-card shadow-sm text-muted-foreground">
            You have no notifications.
          </li>
        ) : (
          notifications.map((notif) => (
            <li
              key={notif.id}
              className={`relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 px-6 py-5 rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md ${
                notif.isRead
                  ? "border-border glass-card opacity-80"
                  : "border-primary/30 bg-primary/5 dark:bg-primary/10"
              }`}
            >
              {!notif.isRead && (
                <span className="absolute left-0 top-0 h-full w-1.5 rounded-l-2xl bg-primary" />
              )}
              
              <div className="mt-1 sm:mt-0 flex-shrink-0">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-sm ${
                  notif.isRead 
                    ? "bg-muted text-muted-foreground border border-border"
                    : "bg-primary/10 text-primary border border-primary/20"
                }`}>
                  <Bell className="h-6 w-6" />
                </div>
              </div>

              <div className="min-w-0 flex-1 w-full">
                <p className={`text-[15px] leading-relaxed ${
                  notif.isRead
                    ? "text-muted-foreground"
                    : "font-semibold text-foreground"
                }`}>
                  {notif.message}
                </p>
                <div className="mt-2.5 flex items-center gap-4 text-xs font-medium text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {new Date(notif.createdAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short"
                    })}
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-border/50">
                {!notif.isRead ? (
                  <button
                    onClick={() => handleMarkAsRead(notif.id)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-primary/10 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/20 transition-all duration-200"
                  >
                    <Check className="h-4 w-4" />
                    <span>Mark as Read</span>
                  </button>
                ) : (
                  <span className="flex items-center justify-center gap-1.5 px-5 py-2.5 text-sm font-medium text-muted-foreground bg-muted/50 rounded-xl">
                    <Check className="h-4 w-4" />
                    <span>Read</span>
                  </span>
                )}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
