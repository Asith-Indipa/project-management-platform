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
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage system preferences, view profile credentials, and personalize layout settings.
        </p>
      </div>

      {saveSuccess && (
        <div className="rounded-xl bg-emerald-500/10 p-4 text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-2 border border-emerald-500/20 shadow-sm animate-in fade-in duration-300">
          <CheckCircle className="h-4 w-4" /> System preferences updated.
        </div>
      )}

      {profileSuccess && (
        <div className="rounded-xl bg-emerald-500/10 p-4 text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-2 border border-emerald-500/20 shadow-sm animate-in fade-in duration-300">
          <CheckCircle className="h-4 w-4" /> Profile details updated successfully.
        </div>
      )}

      {/* Profile Card */}
      <div className="rounded-2xl border border-border glass-card p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2 tracking-tight">
          <User className="h-5 w-5 text-primary" /> Account Profile
        </h2>

        <form onSubmit={handleProfileUpdate} noValidate className="space-y-5">
          {error && (
            <div className="rounded-xl bg-destructive/10 p-4 text-sm font-medium text-destructive border border-destructive/20 animate-in fade-in duration-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Full Name
            </label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground group-focus-within:text-primary transition-colors">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full rounded-xl border border-border bg-background/50 pl-10 pr-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background"
              />
            </div>
            {fieldErrors.name && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.name[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Email Address
            </label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground group-focus-within:text-primary transition-colors">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-border bg-background/50 pl-10 pr-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background"
              />
            </div>
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-destructive">{fieldErrors.email[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              New Password (Optional)
            </label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground group-focus-within:text-primary transition-colors">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-border bg-background/50 pl-10 pr-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background"
              />
            </div>
            <p className="mt-1.5 text-[10px] text-muted-foreground">
              Leave blank to keep current password. If updating, must be at least 6 characters.
            </p>
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-destructive">{fieldErrors.password[0]}</p>
            )}
          </div>

          <div className="flex items-center gap-3 p-4 bg-muted/30 border border-border rounded-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">System Role</span>
              <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-0.5 mt-1 text-[11px] font-bold text-primary">
                {user?.role || "N/A"}
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={updating}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:scale-[1.02] disabled:opacity-50 disabled:pointer-events-none"
            >
              {updating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
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
      <div className="rounded-2xl border border-border glass-card p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2 tracking-tight">
          <Moon className="h-5 w-5 text-primary" /> Appearance
        </h2>
        <p className="text-sm text-muted-foreground mb-8">
          Customize the visual interface of your project management workspace.
        </p>

        <div className="grid grid-cols-2 gap-4">
          {/* Light Theme Button */}
          <button
            onClick={() => handleThemeToggle("light")}
            className={`flex flex-col items-center justify-center p-6 rounded-xl border text-center transition-all duration-200 ${
              !darkMode
                ? "border-primary bg-primary/10 text-primary ring-1 ring-primary shadow-sm"
                : "border-border bg-background/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Sun className="h-7 w-7 mb-3" />
            <span className="text-sm font-semibold">Light Mode</span>
          </button>

          {/* Dark Theme Button */}
          <button
            onClick={() => handleThemeToggle("dark")}
            className={`flex flex-col items-center justify-center p-6 rounded-xl border text-center transition-all duration-200 ${
              darkMode
                ? "border-primary bg-primary/10 text-primary ring-1 ring-primary shadow-sm"
                : "border-border bg-background/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Moon className="h-7 w-7 mb-3" />
            <span className="text-sm font-semibold">Dark Mode</span>
          </button>
        </div>
      </div>
    </div>
  );
}
