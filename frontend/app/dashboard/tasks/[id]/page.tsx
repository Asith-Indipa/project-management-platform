"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft } from "lucide-react";

interface ProjectMember {
  userId: number;
  user: {
    id: number;
    name: string;
    role: string;
  };
}

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
  projectMembers?: ProjectMember[];
}

export default function TaskDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const unwrappedParams = React.use(params);
  const taskId = parseInt(unwrappedParams.id, 10);

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [status, setStatus] = useState<"TODO" | "IN_PROGRESS" | "DONE">("TODO");
  const [progress, setProgress] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [assignedToId, setAssignedToId] = useState("");
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalDateString();

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      // Fetch projects to search for the specific task and load the project's member list
      const projectsRes = await api.get("/projects");
      const projects = projectsRes.data;

      let foundTask: Task | null = null;
      let membersList: ProjectMember[] = [];

      for (const proj of projects) {
        const t = proj.tasks?.find((item: any) => item.id === taskId);
        if (t) {
          foundTask = {
            ...t,
            projectName: proj.name,
          };
          setSelectedProject(proj);
          // Map project members
          membersList = proj.members || [];
          break;
        }
      }

      // Fallback for team members who might only see their task and not the whole project list
      if (!foundTask) {
        try {
          const singleTaskRes = await api.get(`/team-member/tasks/${taskId}`);
          foundTask = singleTaskRes.data;
        } catch (fallbackErr) {
          console.error("Fallback single task retrieval failed", fallbackErr);
        }
      }

      if (foundTask) {
        setTask(foundTask);
        setTitle(foundTask.title);
        setDescription(foundTask.description || "");
        setPriority(foundTask.priority);
        setStatus(foundTask.status);
        setProgress(foundTask.progress);
        setDueDate(foundTask.dueDate ? foundTask.dueDate.substring(0, 10) : "");
        setAssignedToId(foundTask.assignedTo?.id ? String(foundTask.assignedTo.id) : "");
        setProjectMembers(membersList);
      } else {
        setError("Task not found or you do not have permission to view it.");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load task details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  const handleStatusChange = (newStatus: "TODO" | "IN_PROGRESS" | "DONE") => {
    setStatus(newStatus);
    if (newStatus === "TODO") setProgress(0);
    else if (newStatus === "DONE") setProgress(100);
    else if (newStatus === "IN_PROGRESS" && (progress === 0 || progress === 100)) {
      setProgress(50);
    }
  };

  const handleProgressChange = (newProgress: number) => {
    setProgress(newProgress);
    if (newProgress === 0) setStatus("TODO");
    else if (newProgress === 100) setStatus("DONE");
    else setStatus("IN_PROGRESS");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    const canManage = currentUser?.role === "ADMIN" || currentUser?.role === "PROJECT_MANAGER";

    try {
      if (canManage) {
        // Manager or Admin edit full task details
        await api.put(`/tasks/${taskId}`, {
          title,
          description: description || null,
          priority,
          status,
          progress,
          assignedToId: assignedToId ? parseInt(assignedToId, 10) : null,
          dueDate: dueDate || null,
        });
      } else {
        // Team member updates task status/progress
        await api.patch(`/team-member/tasks/${taskId}/status`, { status });
        await api.patch(`/team-member/tasks/${taskId}/progress`, { progress });
      }

      setSuccess("Task updated successfully!");
      router.push("/dashboard/tasks");
    } catch (err: any) {
      const errData = err.response?.data;
      if (errData?.errors) {
        setFieldErrors(errData.errors);
      } else {
        setError(errData?.error || "Failed to save task updates.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800"></div>
        <div className="h-48 w-full animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800"></div>
      </div>
    );
  }

  if (error && !task) {
    return (
      <div className="rounded-xl bg-red-50 p-6 text-red-650 dark:bg-red-950/20 dark:text-red-400">
        <h2 className="text-lg font-bold mb-2">Error Loading Task</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!task) return null;

  const canManage = currentUser?.role === "ADMIN" || currentUser?.role === "PROJECT_MANAGER";
  const isMyTask = task.assignedTo?.id === currentUser?.id;
  const canEditStatus = canManage || isMyTask;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Back and Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/tasks"
          className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Task Details</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {canManage ? "Update details and manage assignees" : "Update task execution progress"}
          </p>
        </div>
      </div>

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

      {/* Main card */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Task Title</label>
            <input
              type="text"
              required
              disabled={!canManage}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none disabled:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:disabled:bg-zinc-900"
            />
            {fieldErrors.title && <p className="mt-1 text-xs text-red-500">{fieldErrors.title[0]}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Description</label>
            <textarea
              disabled={!canManage}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none disabled:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:disabled:bg-zinc-900"
            />
            {fieldErrors.description && <p className="mt-1 text-xs text-red-500">{fieldErrors.description[0]}</p>}
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Parent Project</label>
              <input
                type="text"
                disabled
                value={task.projectName || "Unknown project"}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm outline-none dark:border-zinc-805 dark:bg-zinc-950 text-zinc-500"
              />
            </div>

            <SelectDropdown
              label="Assignee"
              disabled={!canManage}
              value={assignedToId}
              onChange={setAssignedToId}
              placeholder="Select Member"
              options={[
                ...(selectedProject?.manager ? [{
                  value: selectedProject.manager.id,
                  label: `${selectedProject.manager.name} (project manager)`
                }] : []),
                ...projectMembers.map((m) => ({
                  value: m.userId,
                  label: `${m.user.name} (${m.user.role.replace("_", " ").toLowerCase()})`
                }))
              ]}
            />
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <SelectDropdown
              label="Priority"
              disabled={!canManage}
              value={priority}
              onChange={(val) => setPriority(val as any)}
              options={[
                { value: "LOW", label: "Low" },
                { value: "MEDIUM", label: "Medium" },
                { value: "HIGH", label: "High" }
              ]}
            />

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Due Date</label>
              <input
                type="date"
                disabled={!canManage}
                min={selectedProject?.startDate && new Date(selectedProject.startDate).toISOString().split("T")[0] > todayStr ? new Date(selectedProject.startDate).toISOString().split("T")[0] : todayStr}
                max={selectedProject?.endDate ? new Date(selectedProject.endDate).toISOString().split("T")[0] : undefined}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none disabled:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:disabled:bg-zinc-900"
              />
            </div>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 border-t border-zinc-150 pt-4 dark:border-zinc-800">
            <SelectDropdown
              label="Task Status"
              value={status}
              disabled={!canEditStatus}
              onChange={(val) => handleStatusChange(val as any)}
              options={[
                { value: "TODO", label: "To Do" },
                { value: "IN_PROGRESS", label: "In Progress" },
                { value: "DONE", label: "Done" }
              ]}
            />

            <div>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                <span>Task Progress</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{progress}%</span>
              </div>
              <div className="flex items-center gap-3 h-10">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  disabled={!canEditStatus}
                  value={progress}
                  onChange={(e) => handleProgressChange(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-600 h-1.5 rounded bg-zinc-100 dark:bg-zinc-800 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {!canEditStatus && (
            <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
              This task is assigned to another team member. You can only view it.
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <Link
              href="/dashboard/tasks"
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Back
            </Link>
            {canEditStatus && (
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
