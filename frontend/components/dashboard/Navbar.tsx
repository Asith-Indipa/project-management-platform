"use client";

import React, { useState, useEffect, useRef } from "react";
import { Menu, Bell, Sun, Moon } from "lucide-react";
import Breadcrumb from "./Breadcrumb";
import UserProfileDropdown from "./UserProfileDropdown";
import api from "@/lib/api";
import Link from "next/link";

interface NavbarProps {
  onMenuOpen: () => void;
}

interface AppNotification {
  id: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function Navbar({ onMenuOpen }: NavbarProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load and apply theme
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      setDarkMode(isDark);
    }
  }, []);

  const toggleDarkMode = () => {
    const html = document.documentElement;
    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDarkMode(false);
    } else {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications");
      setNotifications(response.data);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-40 flex flex-shrink-0 h-16 w-full items-center justify-between border-b border-border bg-sidebar/90 px-4 md:px-8 shadow-sm backdrop-blur-xl dark:bg-sidebar/90 transition-colors">
      <div className="flex items-center gap-4">
        {/* Hamburger Menu button for Mobile only */}
        <button
          onClick={onMenuOpen}
          className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 focus:outline-none dark:text-zinc-400 dark:hover:bg-zinc-800 md:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Dynamic Breadcrumb path indicator */}
        <div className="hidden sm:block">
          <Breadcrumb />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Dark Mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none transition-all duration-300"
          title="Toggle Theme"
        >
          {darkMode ? <Sun className="h-5 w-5 text-amber-500 hover:rotate-45 transition-transform duration-300" /> : <Moon className="h-5 w-5 text-indigo-500 hover:-rotate-12 transition-transform duration-300" />}
        </button>

        {/* Notification dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none transition-all duration-300"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-extrabold text-destructive-foreground animate-pulse shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-border glass-card py-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-4 duration-200">
              <div className="px-4 py-3 border-b border-border flex justify-between items-center">
                <span className="font-bold text-sm text-zinc-800 dark:text-zinc-100">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold dark:bg-red-950/40 dark:text-red-400">
                    {unreadCount} Unread
                  </span>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-border">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">No notifications.</div>
                ) : (
                  notifications.slice(0, 10).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                      className={`px-4 py-3 text-left text-sm transition-colors cursor-pointer ${
                        notif.isRead
                          ? "text-muted-foreground hover:bg-muted/50"
                          : "text-foreground bg-primary/5 hover:bg-primary/10 font-medium"
                      }`}
                    >
                      <p className="line-clamp-2 leading-relaxed">{notif.message}</p>
                      <span className="text-xs text-muted-foreground block mt-2">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <div className="p-2 border-t border-border mt-1">
                  <Link 
                    href="/dashboard/notifications" 
                    onClick={() => setIsNotifOpen(false)}
                    className="block w-full text-center py-2 text-sm font-medium text-primary hover:text-indigo-700 hover:bg-primary/10 dark:hover:text-indigo-300 rounded-lg transition-colors"
                  >
                    See all notifications
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User profile dropdown menu */}
        <UserProfileDropdown />
      </div>
    </header>
  );
}

