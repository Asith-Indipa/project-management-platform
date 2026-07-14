"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { SelectDropdown } from "@/components/ui/SelectDropdown";

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Input states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const validateForm = () => {
    const errors: Record<string, string[]> = {};
    
    if (!isLogin) {
      if (!name.trim()) {
        errors.name = ["Name is required"];
      } else if (name.length > 50) {
        errors.name = ["Name must be at most 50 characters"];
      }
    }
    
    if (!email.trim()) {
      errors.email = ["Email is required"];
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.email = ["Invalid email address"];
      }
    }
    
    if (!password) {
      errors.password = ["Password is required"];
    } else if (!isLogin && password.length < 6) {
      errors.password = ["Password must be at least 6 characters"];
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        // Sign In Request
        const response = await api.post("/auth/login", { email, password });
        const { token, user: loggedUser } = response.data;
        login(token, loggedUser);
      } else {
        // Sign Up Request
        const response = await api.post("/auth/register", {
          name,
          email,
          password,
        });
        // On successful registration, auto-login or switch to login
        const loginResponse = await api.post("/auth/login", { email, password });
        const { token, user: loggedUser } = loginResponse.data;
        login(token, loggedUser);
      }
    } catch (err: any) {
      const errData = err.response?.data;
      if (errData?.errors) {
        setFieldErrors(errData.errors);
      } else if (errData?.error) {
        if (errData.error === "User already exists") {
          setFieldErrors({ email: ["User already exists"] });
        } else {
          setError(errData.error);
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl glass-card p-8">
        <div className="flex flex-col items-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-primary">
            WorkSync
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Project & Team Task Management
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-lg bg-zinc-100 p-1 mb-6 dark:bg-zinc-800">
          <button
            onClick={() => {
              setIsLogin(true);
              setError(null);
              setFieldErrors({});
            }}
            className={`flex-1 rounded-md py-2 text-sm font-semibold transition-all ${
              isLogin
                ? "bg-white text-primary shadow-sm dark:bg-zinc-700 dark:text-primary"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setError(null);
              setFieldErrors({});
            }}
            className={`flex-1 rounded-md py-2 text-sm font-semibold transition-all ${
              !isLogin
                ? "bg-white text-primary shadow-sm dark:bg-zinc-700 dark:text-primary"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600 dark:bg-red-950/50 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-primary"
              />
              {fieldErrors.name && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.name[0]}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-primary"
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.email[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-primary"
            />
            {!isLogin && !fieldErrors.password && (
              <p className="mt-1 text-[10px] text-zinc-400 dark:text-zinc-500">
                Password must be at least 6 characters long.
              </p>
            )}
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.password[0]}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Processing...
              </span>
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Register Account"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
