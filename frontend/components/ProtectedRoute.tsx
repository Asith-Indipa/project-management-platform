"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("ADMIN" | "PROJECT_MANAGER" | "TEAM_MEMBER")[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-800 dark:border-zinc-800 dark:border-t-zinc-200"></div>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-red-600 dark:text-red-400">Access Denied</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400 max-w-md">
          You do not have the required permissions to view this page. Please contact your administrator.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-6 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
