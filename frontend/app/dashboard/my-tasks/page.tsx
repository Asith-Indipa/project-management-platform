"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Clock,
  CheckCircle,
  Play,
  ArrowLeft,
  ArrowRight,
  Sliders,
  Calendar,
  AlertTriangle,
  ClipboardList,
} from "lucide-react";

interface Task {
  id: number;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  progress: number;
  dueDate: string | null;
  project?: {
    name: string;
  };
}

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal / Edit state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [tempProgress, setTempProgress] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get("/team-member/tasks");
      setTasks(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load your tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const handleMoveTask = async (task: Task, direction: "next" | "prev") => {
    setError(null);
    setSuccess(null);
    let targetStatus: "TODO" | "IN_PROGRESS" | "DONE";

    if (task.status === "TODO" && direction === "next") {
      targetStatus = "IN_PROGRESS";
    } else if (task.status === "IN_PROGRESS") {
      targetStatus = direction === "next" ? "DONE" : "TODO";
    } else if (task.status === "DONE" && direction === "prev") {
      targetStatus = "IN_PROGRESS";
    } else {
      return;
    }

    try {
      await api.patch(`/team-member/tasks/${task.id}/status`, { status: targetStatus });
      setSuccess(`Task moved to ${targetStatus.replace("_", " ")}.`);
      fetchMyTasks();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update task status.");
    }
  };

  const handleUpdateProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    setUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      await api.patch(`/team-member/tasks/${selectedTask.id}/progress`, {
        progress: tempProgress,
      });
      setSuccess("Task progress calibrated successfully!");
      setIsModalOpen(false);
      fetchMyTasks();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update task progress.");
    } finally {
      setUpdating(false);
    }
  };

  const openProgressModal = (task: Task) => {
    setSelectedTask(task);
    setTempProgress(task.progress);
    setIsModalOpen(true);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "No Deadline";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.status === "DONE") return false;
    return new Date(task.dueDate) < new Date();
  };

  // Group tasks by status
  const todoTasks = tasks.filter((t) => t.status === "TODO");
  const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS");
  const doneTasks = tasks.filter((t) => t.status === "DONE");

  return (
    <ProtectedRoute allowedRoles={["TEAM_MEMBER", "ADMIN", "PROJECT_MANAGER"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="pb-4">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">My Workspace Board</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Kanban workflow layout to manage assignments, log current progress, and complete deadlines.
          </p>
        </div>

        {/* Alerts */}
        {success && (
          <div className="rounded-xl bg-emerald-500/10 p-4 text-sm font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm animate-in fade-in duration-300">
            {success}
          </div>
        )}
        {error && (
          <div className="rounded-xl bg-destructive/10 p-4 text-sm font-medium text-destructive border border-destructive/20 shadow-sm animate-in fade-in duration-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800"></div>
            ))}
          </div>
        ) : (
          /* KANBAN GRID */
          <div className="grid gap-6 md:grid-cols-3">
            
            {/* COLUMN 1: TO DO */}
            <div className="rounded-2xl border border-border bg-muted/10 p-4 flex flex-col min-h-[500px]">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/50">
                <span className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-muted-foreground" /> To Do
                </span>
                <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground border border-border">
                  {todoTasks.length}
                </span>
              </div>
              
              <div className="space-y-4 flex-1 overflow-y-auto">
                {todoTasks.map((task) => (
                  <div
                    key={task.id}
                    className="group relative rounded-xl border border-border glass-card p-4 shadow-sm hover:shadow-md transition-all hover:border-primary/20"
                  >
                    {task.project?.name && (
                      <span className="mb-1.5 inline-flex items-center rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary border border-primary/20 truncate max-w-full">
                        {task.project.name}
                      </span>
                    )}
                    <h3 className="font-semibold text-sm text-foreground">{task.title}</h3>
                    
                    <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> {formatDate(task.dueDate)}
                      </span>
                      {isOverdue(task) && (
                        <span className="text-destructive font-bold flex items-center gap-0.5 animate-pulse">
                          <AlertTriangle className="h-3 w-3" /> Overdue
                        </span>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/50 flex justify-between items-center gap-2">
                      <button
                        onClick={() => openProgressModal(task)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Sliders className="h-3.5 w-3.5" /> Progress ({task.progress}%)
                      </button>
                      <button
                        onClick={() => handleMoveTask(task, "next")}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                        title="Move to In Progress"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* COLUMN 2: IN PROGRESS */}
            <div className="rounded-2xl border border-border bg-muted/10 p-4 flex flex-col min-h-[500px]">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/50">
                <span className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                  <Play className="h-4 w-4 text-primary" /> In Progress
                </span>
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary border border-primary/20">
                  {inProgressTasks.length}
                </span>
              </div>

              <div className="space-y-4 flex-1 overflow-y-auto">
                {inProgressTasks.map((task) => (
                  <div
                    key={task.id}
                    className="group relative rounded-xl border border-border glass-card p-4 shadow-sm hover:shadow-md transition-all hover:border-primary/20"
                  >
                    {task.project?.name && (
                      <span className="mb-1.5 inline-flex items-center rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary border border-primary/20 truncate max-w-full">
                        {task.project.name}
                      </span>
                    )}
                    <h3 className="font-semibold text-sm text-foreground">{task.title}</h3>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> {formatDate(task.dueDate)}
                      </span>
                      {isOverdue(task) && (
                        <span className="text-destructive font-bold flex items-center gap-0.5 animate-pulse">
                          <AlertTriangle className="h-3 w-3" /> Overdue
                        </span>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/50 flex justify-between items-center gap-2">
                      <button
                        onClick={() => handleMoveTask(task, "prev")}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                        title="Move back to To Do"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openProgressModal(task)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary/80 transition-colors"
                      >
                        <Sliders className="h-3.5 w-3.5" /> Progress ({task.progress}%)
                      </button>
                      <button
                        onClick={() => handleMoveTask(task, "next")}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                        title="Move to Done"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* COLUMN 3: DONE */}
            <div className="rounded-2xl border border-border bg-muted/10 p-4 flex flex-col min-h-[500px]">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/50">
                <span className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-emerald-500" /> Done
                </span>
                <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {doneTasks.length}
                </span>
              </div>

              <div className="space-y-4 flex-1 overflow-y-auto">
                {doneTasks.map((task) => (
                  <div
                    key={task.id}
                    className="group relative rounded-xl border border-border glass-card p-4 shadow-sm opacity-75"
                  >
                    {task.project?.name && (
                      <span className="mb-1.5 inline-flex items-center rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary border border-primary/20 truncate max-w-full">
                        {task.project.name}
                      </span>
                    )}
                    <h3 className="font-semibold text-sm text-muted-foreground line-through">{task.title}</h3>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> Completed
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/50 flex justify-between items-center gap-2">
                      <button
                        onClick={() => handleMoveTask(task, "prev")}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                        title="Move back to In Progress"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        {task.progress}% Progress
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* PROGRESS ADJUSTMENT MODAL */}
        {isModalOpen && selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <div className="relative w-full max-w-sm rounded-2xl border border-border glass-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
              <h2 className="text-xl font-bold tracking-tight text-foreground mb-2">Calibrate Task Progress</h2>
              <p className="text-sm text-muted-foreground mb-8">
                Adjusting progress will automatically recalibrate task status categories.
              </p>

              <form onSubmit={handleUpdateProgress} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between text-sm font-semibold text-foreground">
                    <span>Progress Percentage</span>
                    <span className="text-primary">{tempProgress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={tempProgress}
                    onChange={(e) => setTempProgress(parseInt(e.target.value, 10))}
                    className="w-full accent-primary h-2 rounded-full bg-muted outline-none appearance-none cursor-pointer"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {updating ? "Saving..." : "Save Progress"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
