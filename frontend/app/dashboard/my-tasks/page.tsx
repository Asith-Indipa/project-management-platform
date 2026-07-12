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
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">My Workspace Board</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Kanban workflow layout to manage assignments, log current progress, and complete deadlines.
          </p>
        </div>

        {/* Alerts */}
        {success && (
          <div className="rounded-lg bg-green-50 p-4 text-sm font-medium text-green-700 dark:bg-green-950/20 dark:text-green-400">
            {success}
          </div>
        )}
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm font-medium text-red-700 dark:bg-red-950/20 dark:text-red-400">
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
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/30 flex flex-col min-h-[500px]">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <span className="font-bold text-sm text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-zinc-500" /> To Do
                </span>
                <span className="rounded bg-zinc-200 px-2 py-0.5 text-xs font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {todoTasks.length}
                </span>
              </div>
              
              <div className="space-y-3 flex-1 overflow-y-auto">
                {todoTasks.map((task) => (
                  <div
                    key={task.id}
                    className="group relative rounded-xl border border-zinc-200 bg-white p-4 shadow-sm hover:shadow dark:border-zinc-850 dark:bg-zinc-900"
                  >
                    <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-50">{task.title}</h3>
                    
                    <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> {formatDate(task.dueDate)}
                      </span>
                      {isOverdue(task) && (
                        <span className="text-red-500 font-bold flex items-center gap-0.5">
                          <AlertTriangle className="h-3 w-3" /> Overdue
                        </span>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center gap-2">
                      <button
                        onClick={() => openProgressModal(task)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-650 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
                      >
                        <Sliders className="h-3.5 w-3.5" /> Progress ({task.progress}%)
                      </button>
                      <button
                        onClick={() => handleMoveTask(task, "next")}
                        className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
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
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/30 flex flex-col min-h-[500px]">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <span className="font-bold text-sm text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Play className="h-4 w-4 text-indigo-500 animate-pulse" /> In Progress
                </span>
                <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-750 dark:bg-indigo-950/30 dark:text-indigo-400">
                  {inProgressTasks.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {inProgressTasks.map((task) => (
                  <div
                    key={task.id}
                    className="group relative rounded-xl border border-zinc-200 bg-white p-4 shadow-sm hover:shadow dark:border-zinc-850 dark:bg-zinc-900"
                  >
                    <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-50">{task.title}</h3>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> {formatDate(task.dueDate)}
                      </span>
                      {isOverdue(task) && (
                        <span className="text-red-500 font-bold flex items-center gap-0.5">
                          <AlertTriangle className="h-3 w-3" /> Overdue
                        </span>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center gap-2">
                      <button
                        onClick={() => handleMoveTask(task, "prev")}
                        className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-650 dark:text-zinc-400"
                        title="Move back to To Do"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openProgressModal(task)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-650 hover:underline dark:text-indigo-400"
                      >
                        <Sliders className="h-3.5 w-3.5" /> Progress ({task.progress}%)
                      </button>
                      <button
                        onClick={() => handleMoveTask(task, "next")}
                        className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-650 dark:text-zinc-400"
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
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/30 flex flex-col min-h-[500px]">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                <span className="font-bold text-sm text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-green-500" /> Done
                </span>
                <span className="rounded bg-green-50 px-2 py-0.5 text-xs font-bold text-green-750 dark:bg-green-950/30 dark:text-green-400">
                  {doneTasks.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {doneTasks.map((task) => (
                  <div
                    key={task.id}
                    className="group relative rounded-xl border border-zinc-200 bg-white p-4 shadow-sm hover:shadow dark:border-zinc-850 dark:bg-zinc-900 opacity-80"
                  >
                    <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-50 line-through text-zinc-450">{task.title}</h3>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> Completed
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center gap-2">
                      <button
                        onClick={() => handleMoveTask(task, "prev")}
                        className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-650 dark:text-zinc-400"
                        title="Move back to In Progress"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                      <span className="text-[11px] font-bold text-green-600 dark:text-green-400">
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
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150 dark:bg-zinc-900 dark:border dark:border-zinc-800">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Calibrate Task Progress</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
                Adjusting progress will automatically recalibrate task status categories.
              </p>

              <form onSubmit={handleUpdateProgress} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Progress Percentage</span>
                    <span className="text-indigo-650 dark:text-indigo-400">{tempProgress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={tempProgress}
                    onChange={(e) => setTempProgress(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-600 h-1.5 rounded bg-zinc-150 dark:bg-zinc-800 outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
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
