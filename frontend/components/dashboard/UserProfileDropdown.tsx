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
        className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 font-bold text-white shadow-md">
          {user.name.charAt(0).toUpperCase()}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-zinc-200 bg-white p-2 shadow-xl animate-in fade-in slide-in-from-top-1 duration-150 dark:border-zinc-800 dark:bg-zinc-900 z-50">
          <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 mb-1">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate">{user.name}</p>
            <p className="text-xs text-zinc-500 truncate dark:text-zinc-400 capitalize">{user.role.replace("_", " ").toLowerCase()}</p>
          </div>
          
          <Link
            href="/dashboard/profile"
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
          >
            <UserIcon className="mr-2 h-4 w-4 text-zinc-500" />
            My Profile
          </Link>
          
          {user.role === "ADMIN" && (
            <Link
              href="/dashboard/settings"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
            >
              <Settings className="mr-2 h-4 w-4 text-zinc-500" />
              Settings
            </Link>
          )}

          <button
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition-colors mt-1"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
