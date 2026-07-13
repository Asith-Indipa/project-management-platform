"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  Play,
  Clock,
  Edit2,
  Trash2,
} from "lucide-react";

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  progress: number;
  dueDate: string | null;
  projectId: number;
  projectName?: string;
  assignedTo: {
    id: number;
    name: string;
    email: string;
  } | null;
}

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [myTasksOnly, setMyTasksOnly] = useState(false);

  // Edit / Status Modals State
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<"TODO" | "IN_PROGRESS" | "DONE">("TODO");
  const [updating, setUpdating] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      // Fetch projects to extract tasks (includes assignedTo and project metadata)
      const projectsResponse = await api.get("/projects");
      const projects = projectsResponse.data;

      const allTasks: Task[] = [];
      projects.forEach((proj: any) => {
        if (proj.tasks && Array.isArray(proj.tasks)) {
          proj.tasks.forEach((t: any) => {
            allTasks.push({
              ...t,
              projectName: proj.name,
            });
          });
        }
      });

      setTasks(allTasks);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    setUpdating(true);
    setError(null);
    try {
      await api.patch(`/tasks/${selectedTask.id}/status`, { status: newStatus });
      setSuccess("Task status updated successfully!");
      setIsStatusOpen(false);
      fetchTasks();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update status.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    setUpdating(true);
    setError(null);
    try {
      await api.delete(`/tasks/${selectedTask.id}`);
      setSuccess("Task deleted successfully!");
      setIsDeleteOpen(false);
      setSelectedTask(null);
      fetchTasks();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete task.");
      setIsDeleteOpen(false);
    } finally {
      setUpdating(false);
    }
  };

  const openStatusModal = (task: Task) => {
    setSelectedTask(task);
    setNewStatus(task.status);
    setIsStatusOpen(true);
  };

  const openDeleteModal = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteOpen(true);
  };

  // Date styling & Overdue determination
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "No Deadline";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.status === "DONE") return false;
    return new Date(task.dueDate) < new Date();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900";
      case "MEDIUM":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900";
      case "LOW":
      default:
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DONE":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400";
      case "IN_PROGRESS":
        return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400";
      case "TODO":
      default:
        return "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400";
    }
  };

  // Filter tasks logic
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description ? task.description.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
      (task.projectName ? task.projectName.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
      (task.assignedTo?.name ? task.assignedTo.name.toLowerCase().includes(searchTerm.toLowerCase()) : false);
    
    const matchesStatus = statusFilter === "ALL" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "ALL" || task.priority === priorityFilter;
    const matchesOwner = !myTasksOnly || task.assignedTo?.id === user?.id;

    return matchesSearch && matchesStatus && matchesPriority && matchesOwner;
  });

  const canManage = user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Tasks</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            View allocated tasks, modify progress stats, and review upcoming project milestones.
          </p>
        </div>
        {canManage && (
          <Link
            href="/dashboard/tasks/create"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" /> Create Task
          </Link>
        )}
      </div>

      {/* Success/Error Alerts */}
      {success && (
        <div className="rounded-lg bg-green-50 p-4 text-sm font-medium text-green-700 dark:bg-green-950/20 dark:text-green-400 flex justify-between items-center">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="text-green-500 hover:text-green-700">×</button>
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm font-medium text-red-700 dark:bg-red-950/20 dark:text-red-400 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">×</button>
        </div>
      )}

      {/* Filters Panel */}
      <div className="flex flex-col xl:flex-row gap-4 items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
        <div className="relative w-full xl:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-10 pr-4 py-2 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-950"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto justify-end">
          {/* My Tasks toggle */}
          <button
            onClick={() => setMyTasksOnly(!myTasksOnly)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold border transition-all ${
              myTasksOnly
                ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900"
                : "bg-white border-zinc-200 text-zinc-600 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400"
            }`}
          >
            My Tasks Only
          </button>

          {/* Status filter */}
          <SelectDropdown
            value={statusFilter}
            onChange={setStatusFilter}
            className="w-full sm:w-40"
            options={[
              { value: "ALL", label: "All Statuses" },
              { value: "TODO", label: "To Do" },
              { value: "IN_PROGRESS", label: "In Progress" },
              { value: "DONE", label: "Done" }
            ]}
          />

          {/* Priority filter */}
          <SelectDropdown
            value={priorityFilter}
            onChange={setPriorityFilter}
            className="w-full sm:w-40"
            options={[
              { value: "ALL", label: "All Priorities" },
              { value: "LOW", label: "Low" },
              { value: "MEDIUM", label: "Medium" },
              { value: "HIGH", label: "High" }
            ]}
          />
        </div>
      </div>

      {/* Task table / loading state */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800"></div>
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white py-12 text-center dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No tasks found matching current filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-950">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Task Title</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Project</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Assignee</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Priority</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Deadline</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredTasks.map((task) => {
                const overdue = isOverdue(task);
                return (
                  <tr key={task.id} className="hover:bg-zinc-50/55 dark:hover:bg-zinc-800/40">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-50">{task.title}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[180px]">
                        {task.description || "No description."}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                      {task.projectName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 font-bold text-[10px] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                          {task.assignedTo?.name ? task.assignedTo.name.charAt(0).toUpperCase() : "?"}
                        </div>
                        <span className="text-sm text-zinc-650 dark:text-zinc-300">{task.assignedTo?.name || "Unassigned"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">{formatDate(task.dueDate)}</span>
                        {overdue && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 dark:text-red-400 mt-0.5 animate-pulse">
                            <AlertTriangle className="h-3 w-3" /> Overdue
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-semibold ${getStatusColor(task.status)}`}>
                        {task.status.replace("_", " ")} ({task.progress}%)
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2">
                      <button
                        onClick={() => openStatusModal(task)}
                        className="inline-flex items-center rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
                        title="Update status"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                      {canManage && (
                        <>
                          <Link
                            href={`/dashboard/tasks/${task.id}`}
                            className="inline-flex items-center rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
                            title="Edit details"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => openDeleteModal(task)}
                            className="inline-flex items-center rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/20"
                            title="Delete task"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* UPDATE STATUS MODAL */}
      {isStatusOpen && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsStatusOpen(false)} />
          <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150 dark:bg-zinc-900 dark:border dark:border-zinc-800">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Update Task Status</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
              Updating status will automatically recalibrate task progress based on your workflow.
            </p>
            <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
                <SelectDropdown
                  label="Status"
                  value={newStatus}
                  onChange={(val) => setNewStatus(val as any)}
                  options={[
                    { value: "TODO", label: "To Do" },
                    { value: "IN_PROGRESS", label: "In Progress" },
                    { value: "DONE", label: "Done" }
                  ]}
                />

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsStatusOpen(false)}
                  className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {updating ? "Updating..." : "Update Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE DIALOG */}
      {isDeleteOpen && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsDeleteOpen(false)} />
          <div className="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150 dark:bg-zinc-900 dark:border dark:border-zinc-800">
            <div className="flex items-center gap-3 text-red-650 dark:text-red-450 mb-3">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <h2 className="text-lg font-bold">Confirm Deletion</h2>
            </div>
            <p className="text-sm text-zinc-650 dark:text-zinc-400 mb-6">
              Are you sure you want to delete task <span className="font-semibold text-zinc-900 dark:text-zinc-50">{selectedTask.title}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTask}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
