"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  User,
  Shield,
  Mail,
  Sun,
  Moon,
  Laptop,
  CheckCircle,
} from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize theme from document element class
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      setDarkMode(isDark);
    }
  }, []);

  const handleThemeToggle = (theme: "light" | "dark") => {
    const html = document.documentElement;
    if (theme === "dark") {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDarkMode(true);
    } else {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setDarkMode(false);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Manage system preferences, view profile credentials, and personalize layout settings.
        </p>
      </div>

      {saveSuccess && (
        <div className="rounded-lg bg-green-50 p-4 text-sm font-medium text-green-700 dark:bg-green-950/20 dark:text-green-400 flex items-center gap-2">
          <CheckCircle className="h-4 w-4" /> System preferences updated.
        </div>
      )}

      {/* Profile Card */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-indigo-500" /> Account Profile
        </h2>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-zinc-50 border border-zinc-100 rounded-lg dark:bg-zinc-950 dark:border-zinc-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <User className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Full Name</span>
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{user?.name || "N/A"}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-zinc-50 border border-zinc-100 rounded-lg dark:bg-zinc-950 dark:border-zinc-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Email Address</span>
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{user?.email || "N/A"}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-zinc-50 border border-zinc-100 rounded-lg dark:bg-zinc-950 dark:border-zinc-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-zinc-400">System Role</span>
              <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400">
                {user?.role || "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2 flex items-center gap-2">
          <Moon className="h-5 w-5 text-indigo-500" /> Appearance
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
          Customize the visual interface of your project management workspace.
        </p>

        <div className="grid grid-cols-2 gap-4">
          {/* Light Theme Button */}
          <button
            onClick={() => handleThemeToggle("light")}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all ${
              !darkMode
                ? "border-indigo-600 bg-indigo-50/20 text-indigo-650 dark:border-indigo-500"
                : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
            }`}
          >
            <Sun className="h-6 w-6 mb-2" />
            <span className="text-sm font-semibold">Light Mode</span>
          </button>

          {/* Dark Theme Button */}
          <button
            onClick={() => handleThemeToggle("dark")}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all ${
              darkMode
                ? "border-indigo-600 bg-indigo-50/20 text-indigo-400 dark:border-indigo-500"
                : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
            }`}
          >
            <Moon className="h-6 w-6 mb-2" />
            <span className="text-sm font-semibold">Dark Mode</span>
          </button>
        </div>
      </div>
    </div>
  );
}
