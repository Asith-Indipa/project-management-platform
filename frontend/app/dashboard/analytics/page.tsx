"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  TrendingUp,
  Briefcase,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ListTodo,
} from "lucide-react";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      try {
        setLoading(true);
        let endpoint = "/dashboard/team-member";
        if (user.role === "ADMIN") {
          endpoint = "/dashboard/admin";
        } else if (user.role === "PROJECT_MANAGER") {
          endpoint = "/dashboard/project-manager";
        }

        const response = await api.get(endpoint);
        setStats(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load analytics data.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800"></div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-6 text-red-650 dark:bg-red-950/20 dark:text-red-400">
        <h2 className="text-lg font-bold mb-2">Analytics Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  // Calculate task completion percentage
  const getTaskCompletionRate = () => {
    if (!stats) return 0;
    if (user?.role === "ADMIN") {
      return stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;
    }
    if (user?.role === "PROJECT_MANAGER") {
      return stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;
    }
    const total = stats.assignedTasks || 0;
    return total > 0 ? Math.round((stats.completedTasks / total) * 100) : 0;
  };

  const completionRate = getTaskCompletionRate();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Analytics</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Real-time performance analytics, milestone logs, and platform operations.
        </p>
      </div>

      {/* METRIC CARD GRID */}
      {user?.role === "ADMIN" && stats && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Total Users</span>
              <Users className="h-5 w-5 text-indigo-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight">{stats.totalUsers}</span>
              <span className="text-xs text-green-500 font-medium">Registered</span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Total Projects</span>
              <Briefcase className="h-5 w-5 text-blue-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight">{stats.totalProjects}</span>
              <span className="text-xs text-blue-500 font-medium">{stats.activeProjects} Active</span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Completed Tasks</span>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight">{stats.completedTasks}</span>
              <span className="text-xs text-zinc-500">of {stats.totalTasks} total</span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Pending Tasks</span>
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight">{stats.pendingTasks}</span>
              <span className="text-xs text-amber-500 font-medium">To do/Active</span>
            </div>
          </div>
        </div>
      )}

      {user?.role === "PROJECT_MANAGER" && stats && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Managed Projects</span>
              <Briefcase className="h-5 w-5 text-blue-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight">{stats.totalProjects}</span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Team Allocation</span>
              <Users className="h-5 w-5 text-indigo-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight">{stats.totalTeamMembers}</span>
              <span className="text-xs text-zinc-500">assigned users</span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Completed Tasks</span>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight">{stats.completedTasks}</span>
              <span className="text-xs text-zinc-500">of {stats.totalTasks} total</span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Active Tasks</span>
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight">{stats.inProgressTasks}</span>
              <span className="text-xs text-amber-500 font-medium">In Progress</span>
            </div>
          </div>
        </div>
      )}

      {user?.role === "TEAM_MEMBER" && stats && (
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Allocated Tasks</span>
              <ListTodo className="h-5 w-5 text-indigo-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight">{stats.assignedTasks}</span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Completed Tasks</span>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight">{stats.completedTasks}</span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Pending Tasks</span>
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight">{stats.pendingTasks}</span>
            </div>
          </div>
        </div>
      )}

      {/* METRIC VISUALIZATIONS SECTION */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Task Completion Progress Meter */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between min-h-[300px]">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Task Completion Rate</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Ratio of done tasks relative to assigned scope.</p>
          </div>
          
          <div className="flex justify-center my-4">
            <div className="relative flex items-center justify-center">
              {/* Simple HSL colored circular progress bar using SVG */}
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="50" strokeWidth="8" stroke="#f4f4f5" className="dark:stroke-zinc-800" fill="transparent" />
                <circle
                  cx="64"
                  cy="64"
                  r="50"
                  strokeWidth="8"
                  stroke="url(#grad)"
                  strokeDasharray={2 * Math.PI * 50}
                  strokeDashoffset={2 * Math.PI * 50 * (1 - completionRate / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                />
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute text-center">
                <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">{completionRate}%</span>
                <p className="text-[10px] uppercase font-bold text-zinc-500">Done</p>
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-zinc-500">
            Keep pushing forward to reach 100% completion!
          </div>
        </div>

        {/* ROLE BASED DETAILED METRICS VIEW */}
        {user?.role === "PROJECT_MANAGER" && stats && (
          <div className="md:col-span-2 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4">My Managed Projects</h3>
            <div className="space-y-4">
              {stats.myProjects?.length === 0 ? (
                <p className="text-sm text-zinc-500">No projects currently managed.</p>
              ) : (
                stats.myProjects?.map((proj: any) => (
                  <div key={proj.id} className="flex items-center justify-between p-4 border border-zinc-100 rounded-lg dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                    <div>
                      <h4 className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">{proj.name}</h4>
                      <span className="text-[10px] font-bold text-indigo-500 uppercase">{proj.status}</span>
                    </div>
                    <Link
                      href={`/dashboard/projects/${proj.id}`}
                      className="inline-flex items-center gap-1 text-xs text-indigo-650 font-bold hover:underline"
                    >
                      Inspect <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {user?.role === "TEAM_MEMBER" && stats && (
          <div className="md:col-span-2 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4">Upcoming Deadlines</h3>
            <div className="space-y-4">
              {stats.upcomingDeadlines?.length === 0 ? (
                <p className="text-sm text-zinc-500">Hooray! No upcoming deadlines.</p>
              ) : (
                stats.upcomingDeadlines?.map((task: any) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border border-zinc-100 rounded-lg dark:border-zinc-800">
                    <div>
                      <h4 className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">{task.title}</h4>
                      <span className="text-[10px] text-red-500 font-bold uppercase">Due {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                    <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                      {task.priority} Priority
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {user?.role === "ADMIN" && (
          <div className="md:col-span-2 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4 font-sans">System Status Overview</h3>
            <div className="space-y-6">
              {/* Task pending ratio bar */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span>Task Breakdown (Completed vs Pending)</span>
                  <span>{stats.completedTasks} Done / {stats.pendingTasks} Pending</span>
                </div>
                <div className="h-3 w-full bg-zinc-100 rounded-full dark:bg-zinc-800 overflow-hidden flex">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0}%` }}
                    title="Completed"
                  />
                  <div
                    className="h-full bg-indigo-500"
                    style={{ width: `${stats.totalTasks > 0 ? (stats.pendingTasks / stats.totalTasks) * 100 : 0}%` }}
                    title="Pending"
                  />
                </div>
              </div>

              {/* Status information panel */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-green-50 border border-green-100 rounded-lg dark:bg-green-950/20 dark:border-green-900/40">
                  <span className="block font-semibold text-green-700 dark:text-green-400">Database Engine</span>
                  <span className="text-zinc-500">Connected & Online</span>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg dark:bg-blue-950/20 dark:border-blue-900/40">
                  <span className="block font-semibold text-blue-700 dark:text-blue-400">Platform Core</span>
                  <span className="text-zinc-500">Running Node v20+</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
