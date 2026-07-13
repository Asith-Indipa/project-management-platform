"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import {
  User,
  Shield,
  Mail,
  Sun,
  Moon,
  CheckCircle,
  Lock,
  Save,
  Loader2,
} from "lucide-react";

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Profile fields state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Initialize theme from document element class and user fields
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      setDarkMode(isDark);
    }
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

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

  const validateForm = () => {
    const errors: Record<string, string[]> = {};

    if (!name.trim()) {
      errors.name = ["Name is required"];
    } else if (name.length > 50) {
      errors.name = ["Name must be at most 50 characters"];
    }

    if (!email.trim()) {
      errors.email = ["Email is required"];
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.email = ["Invalid email address"];
      }
    }

    if (password && password.length < 6) {
      errors.password = ["Password must be at least 6 characters"];
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setProfileSuccess(false);

    if (!validateForm()) {
      return;
    }

    setUpdating(true);
    try {
      const response = await api.put("/auth/profile", {
        name,
        email,
        password: password || undefined,
      });

      if (response.data.success) {
        updateUser(response.data.user);
        setProfileSuccess(true);
        setPassword(""); // Clear password field
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } catch (err: any) {
      const errData = err.response?.data;
      if (errData?.errors) {
        setFieldErrors(errData.errors);
      } else if (errData?.error) {
        if (errData.error === "Email address already in use") {
          setFieldErrors({ email: ["Email address already in use"] });
        } else {
          setError(errData.error);
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setUpdating(false);
    }
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

      {profileSuccess && (
        <div className="rounded-lg bg-green-50 p-4 text-sm font-medium text-green-700 dark:bg-green-950/20 dark:text-green-400 flex items-center gap-2">
          <CheckCircle className="h-4 w-4" /> Profile details updated successfully.
        </div>
      )}

      {/* Profile Card */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-indigo-500" /> Account Profile
        </h2>

        <form onSubmit={handleProfileUpdate} noValidate className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600 dark:bg-red-950/50 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-indigo-500 dark:focus:ring-indigo-950"
              />
            </div>
            {fieldErrors.name && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.name[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-indigo-500 dark:focus:ring-indigo-950"
              />
            </div>
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.email[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
              New Password (Optional)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-indigo-500 dark:focus:ring-indigo-950"
              />
            </div>
            <p className="mt-1 text-[10px] text-zinc-400 dark:text-zinc-500">
              Leave blank to keep current password. If updating, must be at least 6 characters.
            </p>
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.password[0]}</p>
            )}
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

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={updating}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:opacity-95 active:scale-95 disabled:opacity-50 disabled:pointer-events-none dark:from-indigo-500 dark:to-purple-500"
            >
              {updating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Update Profile Details</span>
                </>
              )}
            </button>
          </div>
        </form>
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
                ? "border-indigo-650 bg-indigo-50/20 text-indigo-650 dark:border-indigo-500"
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
                ? "border-indigo-650 bg-indigo-50/20 text-indigo-400 dark:border-indigo-500"
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
