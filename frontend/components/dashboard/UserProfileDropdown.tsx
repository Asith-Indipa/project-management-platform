"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User as UserIcon, Settings } from "lucide-react";
import Link from "next/link";

export default function UserProfileDropdown() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-all hover:scale-105"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-indigo-400 font-bold text-white shadow-sm ring-2 ring-background">
          {user.name.charAt(0).toUpperCase()}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 origin-top-right rounded-2xl border border-border glass-card p-2 shadow-xl animate-in fade-in slide-in-from-top-4 duration-200 z-50">
          <div className="px-3 py-3 border-b border-border mb-1">
            <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate capitalize font-medium">{user.role.replace("_", " ").toLowerCase()}</p>
          </div>
          
          <Link
            href="/dashboard/settings"
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
            My Profile & Settings
          </Link>

          <button
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            className="flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors mt-1"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
