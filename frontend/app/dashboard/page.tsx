"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import {
  Users,
  Briefcase,
  CheckSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        let endpoint = "";

        if (user?.role === "ADMIN") {
          endpoint = "/dashboard/admin";
        } else if (user?.role === "PROJECT_MANAGER") {
          endpoint = "/dashboard/project-manager";
        } else if (user?.role === "TEAM_MEMBER") {
          endpoint = "/dashboard/team-member";
        }

        if (endpoint) {
          const response = await api.get(endpoint);
          setStats(response.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="h-8 w-64 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800"></div>
        {/* Grid Skeleton */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-6 text-red-600 dark:bg-red-950/20 dark:text-red-400">
        <h2 className="text-lg font-semibold mb-2">Error Loading Dashboard</h2>
        <p>{error}</p>
      </div>
    );
  }

  // Helper to format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Here is what is happening in your workspace today.
        </p>
      </div>

      {/* ADMIN DASHBOARD VIEW */}
      {user?.role === "ADMIN" && stats && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card 1 */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Total Users</span>
                <Users className="h-6 w-6 text-indigo-500" />
              </div>
              <p className="mt-4 text-3xl font-bold text-zinc-900 dark:text-zinc-50">{stats.totalUsers}</p>
            </div>
            {/* Card 2 */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Total Projects</span>
                <Briefcase className="h-6 w-6 text-purple-500" />
              </div>
              <p className="mt-4 text-3xl font-bold text-zinc-900 dark:text-zinc-50">{stats.totalProjects}</p>
              <p className="mt-1 text-xs text-green-600 dark:text-green-400 font-medium">
                {stats.activeProjects} active projects
              </p>
            </div>
            {/* Card 3 */}
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Total Tasks</span>
                <CheckSquare className="h-6 w-6 text-pink-500" />
              </div>
              <p className="mt-4 text-3xl font-bold text-zinc-900 dark:text-zinc-50">{stats.totalTasks}</p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {stats.completedTasks} completed • {stats.pendingTasks} pending
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PROJECT MANAGER DASHBOARD VIEW */}
      {user?.role === "PROJECT_MANAGER" && stats && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Managed Projects</span>
                <Briefcase className="h-6 w-6 text-indigo-500" />
              </div>
              <p className="mt-4 text-3xl font-bold text-zinc-900 dark:text-zinc-50">{stats.totalProjects}</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Assigned Team Members</span>
                <Users className="h-6 w-6 text-purple-500" />
              </div>
              <p className="mt-4 text-3xl font-bold text-zinc-900 dark:text-zinc-50">{stats.totalTeamMembers}</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Project Tasks</span>
                <CheckSquare className="h-6 w-6 text-pink-500" />
              </div>
              <p className="mt-4 text-3xl font-bold text-zinc-900 dark:text-zinc-50">{stats.totalTasks}</p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {stats.completedTasks} completed • {stats.inProgressTasks} in progress
              </p>
            </div>
          </div>

          {/* Managed Projects List */}
          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 p-6">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4">My Managed Projects</h2>
            {stats.myProjects.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">You are not managing any projects yet.</p>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {stats.myProjects.map((project: any) => (
                  <div key={project.id} className="flex items-center justify-between py-3">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{project.name}</h3>
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium mt-1 ${
                        project.status === "ACTIVE"
                          ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                          : project.status === "PLANNING"
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    <Link
                      href={`/dashboard/projects`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                    >
                      Manage <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TEAM MEMBER DASHBOARD VIEW */}
      {user?.role === "TEAM_MEMBER" && stats && (
        <div className="grid gap-6 lg:grid-cols-3 animate-in fade-in duration-300">
          {/* Left / Stats section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">My Tasks</span>
                  <CheckSquare className="h-6 w-6 text-indigo-500" />
                </div>
                <p className="mt-4 text-3xl font-bold text-zinc-900 dark:text-zinc-50">{stats.assignedTasks}</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Completed</span>
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <p className="mt-4 text-3xl font-bold text-zinc-900 dark:text-zinc-50">{stats.completedTasks}</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Pending</span>
                  <Clock className="h-6 w-6 text-amber-500" />
                </div>
                <p className="mt-4 text-3xl font-bold text-zinc-900 dark:text-zinc-50">{stats.pendingTasks}</p>
              </div>
            </div>

            {/* Quick Links / Banner */}
            <div className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white dark:from-indigo-950 dark:to-purple-950">
              <h2 className="text-lg font-bold">Track Your Task Progress</h2>
              <p className="mt-1 text-sm text-indigo-100">
                Check and update your assigned tasks regularly to keep the team updated on your progress.
              </p>
              <Link
                href="/dashboard/tasks"
                className="inline-block mt-4 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-indigo-600 shadow-sm transition-all hover:bg-indigo-50 dark:bg-zinc-900 dark:text-indigo-400 dark:hover:bg-zinc-800"
              >
                Go to My Tasks
              </Link>
            </div>
          </div>

          {/* Right / Upcoming Deadlines section */}
          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 p-6">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-500" /> Upcoming Deadlines
            </h2>
            {stats.upcomingDeadlines.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No upcoming pending deadlines! 🎉</p>
            ) : (
              <div className="space-y-4">
                {stats.upcomingDeadlines.map((task: any) => {
                  const isHigh = task.priority === "HIGH";
                  return (
                    <div key={task.id} className="rounded-lg border border-zinc-100 p-3 dark:border-zinc-800 dark:bg-zinc-950/40">
                      <div className="flex items-start justify-between">
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate max-w-[150px]">
                          {task.title}
                        </h3>
                        <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${
                          isHigh
                            ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                            : task.priority === "MEDIUM"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                            : "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                        <span className="flex items-center gap-1 text-red-500 dark:text-red-400 font-medium">
                          <AlertCircle className="h-3 w-3" /> Due {formatDate(task.dueDate)}
                        </span>
                        <span className="capitalize">{task.status.toLowerCase().replace("_", " ")}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
