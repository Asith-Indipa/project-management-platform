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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground tracking-tight flex items-center gap-2">
            Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-400">{user?.name}</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Monitor activities, review logs, and update milestones in real-time.
          </p>
        </div>
        <span className="inline-flex self-start sm:self-center items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary shadow-sm">
          {user?.role?.replace("_", " ")}
        </span>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {/* LEFT COLUMN: CARDS & GRAPHS */}
        <div className="xl:col-span-2 space-y-8 max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-hide">
          
          {/* STATS COUNTER BLOCKS */}
          {user?.role === "ADMIN" && stats && (
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="glass-card rounded-2xl p-6 group">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Total Users</span>
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <p className="mt-6 text-4xl font-semibold tracking-tight text-foreground">{stats.totalUsers}</p>
              </div>
              <div className="glass-card rounded-2xl p-6 group">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Total Projects</span>
                  <div className="p-2 bg-purple-500/10 rounded-xl">
                    <Briefcase className="h-5 w-5 text-purple-500" />
                  </div>
                </div>
                <p className="mt-6 text-4xl font-semibold tracking-tight text-foreground">{stats.totalProjects}</p>
                <div className="mt-3 flex items-center gap-2 text-xs font-medium">
                  <span className="px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md">{stats.activeProjects} Active</span>
                  <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md">{stats.completedProjects || 0} Done</span>
                </div>
              </div>
              <div className="glass-card rounded-2xl p-6 group">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Total Tasks</span>
                  <div className="p-2 bg-pink-500/10 rounded-xl">
                    <CheckSquare className="h-5 w-5 text-pink-500" />
                  </div>
                </div>
                <p className="mt-6 text-4xl font-semibold tracking-tight text-foreground">{stats.totalTasks}</p>
                <p className="mt-3 text-xs text-muted-foreground flex items-center gap-2 font-medium">
                  <span className="text-emerald-500">{stats.completedTasks} done</span> <span className="text-border">•</span> <span className="text-amber-500">{stats.pendingTasks} pending</span>
                </p>
              </div>
            </div>
          )}

          {user?.role === "PROJECT_MANAGER" && stats && (
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="glass-card rounded-2xl p-6 group">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Managed Projects</span>
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <p className="mt-6 text-4xl font-semibold tracking-tight text-foreground">{stats.totalProjects}</p>
              </div>
              <div className="glass-card rounded-2xl p-6 group">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Team Members</span>
                  <div className="p-2 bg-purple-500/10 rounded-xl">
                    <Users className="h-5 w-5 text-purple-500" />
                  </div>
                </div>
                <p className="mt-6 text-4xl font-semibold tracking-tight text-foreground">{stats.totalTeamMembers}</p>
              </div>
              <div className="glass-card rounded-2xl p-6 group">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Project Tasks</span>
                  <div className="p-2 bg-pink-500/10 rounded-xl">
                    <CheckSquare className="h-5 w-5 text-pink-500" />
                  </div>
                </div>
                <p className="mt-6 text-4xl font-semibold tracking-tight text-foreground">{stats.totalTasks}</p>
                <p className="mt-3 text-xs text-muted-foreground flex items-center gap-2 font-medium">
                  <span className="text-emerald-500">{stats.completedTasks} done</span> <span className="text-border">•</span> <span className="text-amber-500">{stats.inProgressTasks} active</span>
                </p>
              </div>
            </div>
          )}

          {user?.role === "TEAM_MEMBER" && stats && (
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="glass-card rounded-2xl p-6 group">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">My Tasks</span>
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <CheckSquare className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <p className="mt-6 text-4xl font-semibold tracking-tight text-foreground">{stats.assignedTasks}</p>
              </div>
              <div className="glass-card rounded-2xl p-6 group">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Completed</span>
                  <div className="p-2 bg-emerald-500/10 rounded-xl">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  </div>
                </div>
                <p className="mt-6 text-4xl font-semibold tracking-tight text-foreground">{stats.completedTasks}</p>
              </div>
              <div className="glass-card rounded-2xl p-6 group">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Pending</span>
                  <div className="p-2 bg-amber-500/10 rounded-xl">
                    <Clock className="h-5 w-5 text-amber-500" />
                  </div>
                </div>
                <p className="mt-6 text-4xl font-semibold tracking-tight text-foreground">{stats.pendingTasks}</p>
              </div>
            </div>
          )}

          {/* VISUAL CHARTS PANEL */}
          <div className="glass-card rounded-2xl p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-foreground mb-2 tracking-tight">Workspace Execution Overview</h2>
            <p className="text-sm text-muted-foreground mb-8">Visual representation of task completion metrics across all active projects.</p>

            <div className="grid gap-8 md:grid-cols-2 items-center">
              {/* Task Breakdown visual horizontal bars */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm font-medium mb-3">
                    <span className="text-foreground">Task Completion Rate</span>
                    <span className="text-primary font-semibold">{completionRate}%</span>
                  </div>
                  <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-indigo-400 transition-all duration-1000 ease-out" style={{ width: `${completionRate}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm font-medium">
                  <div className="p-4 rounded-xl border border-border bg-background shadow-sm hover:shadow-md transition-shadow">
                    <span className="block text-muted-foreground mb-2">Completed Tasks</span>
                    <span className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">{completed}</span>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-background shadow-sm hover:shadow-md transition-shadow">
                    <span className="block text-muted-foreground mb-2">Pending / Active</span>
                    <span className="text-2xl font-semibold text-amber-500">{pending}</span>
                  </div>
                </div>
              </div>

              {/* SVG circular dial graph */}
              <div className="flex justify-center">
                <div className="relative flex items-center justify-center scale-110">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle cx="80" cy="80" r="65" strokeWidth="12" stroke="currentColor" className="text-muted" fill="transparent" />
                    <circle
                      cx="80"
                      cy="80"
                      r="65"
                      strokeWidth="12"
                      stroke="url(#gradient)"
                      strokeDasharray={2 * Math.PI * 65}
                      strokeDashoffset={2 * Math.PI * 65 * (1 - completionRate / 100)}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#4f46e5" />
                        <stop offset="100%" stopColor="#818cf8" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute text-center flex flex-col items-center">
                    <span className="text-4xl font-semibold text-foreground tracking-tight">{completionRate}%</span>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1">Completed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ROLE BASED DETAILED PROJECTS LIST FOR MANAGEMENT */}
          {user?.role === "PROJECT_MANAGER" && stats && (
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 tracking-tight">My Managed Projects</h2>
              {stats.myProjects.length === 0 ? (
                <p className="text-sm text-muted-foreground">You are not managing any projects yet.</p>
              ) : (
                <div className="divide-y divide-border">
                  {stats.myProjects.map((project: any) => (
                    <div key={project.id} className="flex items-center justify-between py-4 group">
                      <div>
                        <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{project.name}</h3>
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium mt-1.5 ${
                          project.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : project.status === "PLANNING"
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}>
                          {project.status}
                        </span>
                      </div>
                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className="inline-flex items-center justify-center p-2 rounded-lg bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {user?.role === "TEAM_MEMBER" && stats && (
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2 tracking-tight">
                <Calendar className="h-5 w-5 text-primary" /> Upcoming Deadlines
              </h2>
              {stats.upcomingDeadlines.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming pending deadlines! 🎉</p>
              ) : (
                <div className="space-y-4">
                  {stats.upcomingDeadlines.map((task: any) => {
                    const isHigh = task.priority === "HIGH";
                    return (
                      <div key={task.id} className="rounded-xl border border-border p-4 bg-background shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex items-start justify-between">
                          <h3 className="text-sm font-medium text-foreground truncate max-w-[200px] group-hover:text-primary transition-colors">
                            {task.title}
                          </h3>
                          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                            isHigh
                              ? "bg-red-500/10 text-red-600 dark:text-red-400"
                              : task.priority === "MEDIUM"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground font-medium">
                          <span className="flex items-center gap-1.5 text-destructive dark:text-red-400">
                            <AlertCircle className="h-3.5 w-3.5" /> Due {formatDate(task.dueDate)}
                          </span>
                          <span className="capitalize px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                            {task.status.toLowerCase().replace("_", " ")}
                          </span>
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
        <div className="glass-card rounded-2xl p-6 h-fit max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-hide">
          <h2 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2 tracking-tight">
            <Activity className="h-5 w-5 text-primary" /> Recent Activities
          </h2>
          <p className="text-sm text-muted-foreground mb-8">Real-time workflow audit log.</p>

          <div className="relative border-l border-border pl-6 space-y-8">
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity logged yet.</p>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="relative group">
                  {/* Bullet indicator on the line */}
                  <span className="absolute -left-[29px] top-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-primary ring-4 ring-background group-hover:scale-125 transition-transform" />
                  
                  <div className="space-y-1.5 bg-muted/40 hover:bg-muted/80 p-3 rounded-xl transition-colors border border-transparent hover:border-border">
                    <p className="text-sm font-medium text-foreground">
                      <span className="font-semibold text-primary">{act.user.name}</span> {act.description}
                    </p>
                    <span className="block text-xs text-muted-foreground font-medium">
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
