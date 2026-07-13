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
  Activity,
} from "lucide-react";
import Link from "next/link";

interface ActivityItem {
  id: number;
  description: string;
  createdAt: string;
  user: {
    name: string;
    role: string;
  };
  project?: {
    name: string;
  };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      let statsEndpoint = "";

      if (user?.role === "ADMIN") {
        statsEndpoint = "/dashboard/admin";
      } else if (user?.role === "PROJECT_MANAGER") {
        statsEndpoint = "/dashboard/project-manager";
      } else if (user?.role === "TEAM_MEMBER") {
        statsEndpoint = "/dashboard/team-member";
      }

      if (statsEndpoint) {
        const statsRes = await api.get(statsEndpoint);
        setStats(statsRes.data);
      }

      // Fetch system timeline activities
      const activitiesRes = await api.get("/activities");
      setActivities(activitiesRes.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Helper to format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400";
      case "PROJECT_MANAGER":
        return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-zinc-205 dark:bg-zinc-800"></div>
        <div className="grid gap-6 md:grid-cols-3">
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

  // Pure SVG Pie/Bar Graph calculation values
  const totalTasks = stats?.totalTasks || stats?.assignedTasks || 0;
  const completed = stats?.completedTasks || 0;
  const pending = stats?.pendingTasks || stats?.inProgressTasks || 0;
  const completionRate = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Monitor activities, review logs, and update milestones.
          </p>
        </div>
        <span className={`inline-flex self-start sm:self-center items-center rounded-lg border px-3 py-1 text-xs font-bold ${getRoleBadgeColor(user?.role || "")}`}>
          {user?.role?.replace("_", " ")}
        </span>
      </div>

      <div className="grid gap-8 xl:grid-cols-3">
        {/* LEFT COLUMN: CARDS & GRAPHS */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* STATS COUNTER BLOCKS */}
          {user?.role === "ADMIN" && stats && (
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Total Users</span>
                  <Users className="h-6 w-6 text-indigo-500" />
                </div>
                <p className="mt-4 text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">{stats.totalUsers}</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Total Projects</span>
                  <Briefcase className="h-6 w-6 text-purple-500" />
                </div>
                <p className="mt-4 text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">{stats.totalProjects}</p>
                <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold">
                  <span className="text-blue-500">{stats.activeProjects} Active</span>
                  <span className="text-zinc-300 dark:text-zinc-700">•</span>
                  <span className="text-green-500">{stats.completedProjects || 0} Completed</span>
                </div>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Total Tasks</span>
                  <CheckSquare className="h-6 w-6 text-pink-500" />
                </div>
                <p className="mt-4 text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">{stats.totalTasks}</p>
                <p className="mt-1 text-xs text-zinc-550 dark:text-zinc-400">
                  {stats.completedTasks} completed • {stats.pendingTasks} pending
                </p>
              </div>
            </div>
          )}

          {user?.role === "PROJECT_MANAGER" && stats && (
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Managed Projects</span>
                  <Briefcase className="h-6 w-6 text-indigo-500" />
                </div>
                <p className="mt-4 text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">{stats.totalProjects}</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Assigned Team Members</span>
                  <Users className="h-6 w-6 text-purple-500" />
                </div>
                <p className="mt-4 text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">{stats.totalTeamMembers}</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Project Tasks</span>
                  <CheckSquare className="h-6 w-6 text-pink-500" />
                </div>
                <p className="mt-4 text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">{stats.totalTasks}</p>
                <p className="mt-1 text-xs text-zinc-550 dark:text-zinc-400">
                  {stats.completedTasks} completed • {stats.inProgressTasks} active
                </p>
              </div>
            </div>
          )}

          {user?.role === "TEAM_MEMBER" && stats && (
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">My Tasks</span>
                  <CheckSquare className="h-6 w-6 text-indigo-500" />
                </div>
                <p className="mt-4 text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">{stats.assignedTasks}</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Completed</span>
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <p className="mt-4 text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">{stats.completedTasks}</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Pending</span>
                  <Clock className="h-6 w-6 text-amber-500" />
                </div>
                <p className="mt-4 text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">{stats.pendingTasks}</p>
              </div>
            </div>
          )}

          {/* VISUAL CHARTS PANEL */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">Workspace Execution Overview</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">Visual representation of task completion metrics.</p>

            <div className="grid gap-6 md:grid-cols-2 items-center">
              {/* Task Breakdown visual horizontal bars */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Task Completion rate</span>
                    <span>{completionRate}%</span>
                  </div>
                  <div className="h-3 w-full bg-zinc-100 rounded-full dark:bg-zinc-800 overflow-hidden">
                    <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${completionRate}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                  <div className="p-3 border border-zinc-150 rounded-lg dark:border-zinc-800 bg-zinc-50/20">
                    <span className="block text-zinc-450">Completed Tasks</span>
                    <span className="text-lg font-extrabold text-green-600 dark:text-green-400">{completed}</span>
                  </div>
                  <div className="p-3 border border-zinc-150 rounded-lg dark:border-zinc-800 bg-zinc-50/20">
                    <span className="block text-zinc-450">Pending / Active</span>
                    <span className="text-lg font-extrabold text-amber-500">{pending}</span>
                  </div>
                </div>
              </div>

              {/* SVG circular dial graph */}
              <div className="flex justify-center">
                <div className="relative flex items-center justify-center">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle cx="80" cy="80" r="65" strokeWidth="8" stroke="#f4f4f5" className="dark:stroke-zinc-800" fill="transparent" />
                    <circle
                      cx="80"
                      cy="80"
                      r="65"
                      strokeWidth="8"
                      stroke="#4f46e5"
                      strokeDasharray={2 * Math.PI * 65}
                      strokeDashoffset={2 * Math.PI * 65 * (1 - completionRate / 100)}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">{completionRate}%</span>
                    <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Scope Completed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ROLE BASED DETAILED PROJECTS LIST FOR MANAGEMENT */}
          {user?.role === "PROJECT_MANAGER" && stats && (
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
                        href={`/dashboard/projects/${project.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-650 hover:underline"
                      >
                        Manage <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {user?.role === "TEAM_MEMBER" && stats && (
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
                          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate max-w-[200px]">
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
          )}

        </div>

        {/* RIGHT COLUMN: SYSTEM ACTIVITY TIMELINE */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2 flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-500" /> Recent Activities
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">Real-time workflow audit log logs.</p>

          <div className="relative border-l border-zinc-200 pl-4 dark:border-zinc-800 space-y-6">
            {activities.length === 0 ? (
              <p className="text-xs text-zinc-400 pl-2">No activity logged yet.</p>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="relative group">
                  {/* Bullet indicator on the line */}
                  <span className="absolute -left-[21px] top-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-indigo-600 border border-white dark:border-zinc-900 group-hover:scale-125 transition-transform" />
                  
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-zinc-850 dark:text-zinc-100">
                      <span className="font-extrabold text-indigo-650">{act.user.name}</span> {act.description}
                    </p>
                    <span className="block text-[10px] text-zinc-400">
                      {new Date(act.createdAt).toLocaleDateString()} at {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
