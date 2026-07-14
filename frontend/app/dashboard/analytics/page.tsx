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
      <div className="pb-4">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2">
          Analytics
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Real-time performance analytics, milestone logs, and platform operations.
        </p>
      </div>

      {/* METRIC CARD GRID */}
      {user?.role === "ADMIN" && stats && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border glass-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Total Users</span>
              <Users className="h-5 w-5 text-indigo-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-foreground">{stats.totalUsers}</span>
              <span className="text-xs text-emerald-500 font-medium">Registered</span>
            </div>
          </div>

          <div className="rounded-2xl border border-border glass-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Total Projects</span>
              <Briefcase className="h-5 w-5 text-blue-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-foreground">{stats.totalProjects}</span>
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <span className="text-blue-500">{stats.activeProjects} Active</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-emerald-500">{stats.completedProjects || 0} Completed</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border glass-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Completed Tasks</span>
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-foreground">{stats.completedTasks}</span>
              <span className="text-xs text-muted-foreground">of {stats.totalTasks} total</span>
            </div>
          </div>

          <div className="rounded-2xl border border-border glass-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Pending Tasks</span>
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-foreground">{stats.pendingTasks}</span>
              <span className="text-xs text-amber-500 font-medium">To do/Active</span>
            </div>
          </div>
        </div>
      )}

      {user?.role === "PROJECT_MANAGER" && stats && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border glass-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Managed Projects</span>
              <Briefcase className="h-5 w-5 text-blue-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-foreground">{stats.totalProjects}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-border glass-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Team Allocation</span>
              <Users className="h-5 w-5 text-indigo-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-foreground">{stats.totalTeamMembers}</span>
              <span className="text-xs text-muted-foreground">assigned users</span>
            </div>
          </div>

          <div className="rounded-2xl border border-border glass-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Completed Tasks</span>
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-foreground">{stats.completedTasks}</span>
              <span className="text-xs text-muted-foreground">of {stats.totalTasks} total</span>
            </div>
          </div>

          <div className="rounded-2xl border border-border glass-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Active Tasks</span>
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-foreground">{stats.inProgressTasks}</span>
              <span className="text-xs text-amber-500 font-medium">In Progress</span>
            </div>
          </div>
        </div>
      )}

      {user?.role === "TEAM_MEMBER" && stats && (
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-border glass-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Allocated Tasks</span>
              <ListTodo className="h-5 w-5 text-indigo-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-foreground">{stats.assignedTasks}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-border glass-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Completed Tasks</span>
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-foreground">{stats.completedTasks}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-border glass-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Pending Tasks</span>
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-foreground">{stats.pendingTasks}</span>
            </div>
          </div>
        </div>
      )}

      {/* METRIC VISUALIZATIONS SECTION */}
      <div className="grid gap-8 md:grid-cols-3">
        {/* Task Completion Progress Meter */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 flex flex-col justify-between min-h-[300px] shadow-sm">
          <div>
            <h3 className="text-lg font-semibold text-foreground tracking-tight">Task Completion Rate</h3>
            <p className="text-sm text-muted-foreground mt-1">Ratio of done tasks relative to assigned scope.</p>
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
                <span className="text-3xl font-extrabold text-foreground">{completionRate}%</span>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Done</p>
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            Keep pushing forward to reach 100% completion!
          </div>
        </div>

        {/* ROLE BASED DETAILED METRICS VIEW */}
        {user?.role === "PROJECT_MANAGER" && stats && (
          <div className="md:col-span-2 rounded-2xl border border-border glass-card p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-4">My Managed Projects</h3>
            <div className="space-y-4">
              {stats.myProjects?.length === 0 ? (
                <p className="text-sm text-muted-foreground">No projects currently managed.</p>
              ) : (
                stats.myProjects?.map((proj: any) => (
                  <div key={proj.id} className="flex items-center justify-between p-4 border border-border/50 rounded-xl hover:bg-muted/30 transition-colors">
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">{proj.name}</h4>
                      <span className="text-[10px] font-bold text-primary uppercase">{proj.status}</span>
                    </div>
                    <Link
                      href={`/dashboard/projects/${proj.id}`}
                      className="inline-flex items-center gap-1 text-xs text-primary font-bold hover:underline"
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
          <div className="md:col-span-2 glass-card rounded-2xl p-6 sm:p-8 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-6 tracking-tight">Upcoming Deadlines</h3>
            <div className="space-y-4">
              {stats.upcomingDeadlines?.length === 0 ? (
                <p className="text-sm text-muted-foreground">Hooray! No upcoming deadlines.</p>
              ) : (
                stats.upcomingDeadlines?.map((task: any) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-muted/10">
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">{task.title}</h4>
                      <span className="text-[10px] text-destructive font-bold uppercase">Due {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                    <span className="inline-flex items-center rounded-md bg-amber-500/10 px-2 py-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      {task.priority} Priority
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {user?.role === "ADMIN" && (
          <div className="md:col-span-2 glass-card rounded-2xl p-6 sm:p-8 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-6 tracking-tight">System Status Overview</h3>
            <div className="space-y-8">
              {/* Task pending ratio bar */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-2 text-foreground">
                  <span>Task Breakdown (Completed vs Pending)</span>
                  <span className="text-muted-foreground">{stats.completedTasks} Done / {stats.pendingTasks} Pending</span>
                </div>
                <div className="h-3 w-full bg-muted rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0}%` }}
                    title="Completed"
                  />
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${stats.totalTasks > 0 ? (stats.pendingTasks / stats.totalTasks) * 100 : 0}%` }}
                    title="Pending"
                  />
                </div>
              </div>

              {/* Status information panel */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <span className="block font-semibold text-emerald-600 dark:text-emerald-400">Database Engine</span>
                  <span className="text-muted-foreground">Connected & Online</span>
                </div>
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <span className="block font-semibold text-blue-600 dark:text-blue-400">Platform Core</span>
                  <span className="text-muted-foreground">Running Node v20+</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
