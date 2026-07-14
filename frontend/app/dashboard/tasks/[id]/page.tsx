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
      router.back();
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
        <button
          onClick={() => router.back()}
          type="button"
          className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-border glass-card text-muted-foreground hover:text-foreground transition-colors shadow-sm hover:shadow-md"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Task Details</h1>
          <p className="text-sm text-muted-foreground">
            {canManage ? "Update details and manage assignees" : "Update task execution progress"}
          </p>
        </div>
      </div>

      {success && (
        <div className="rounded-xl bg-emerald-500/10 p-4 text-sm font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm">
          {success}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-destructive/10 p-4 text-sm font-medium text-destructive border border-destructive/20 shadow-sm">
          {error}
        </div>
      )}

      {/* Main card */}
      <div className="rounded-2xl border border-border glass-card p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Task Title</label>
            <input
              type="text"
              required
              disabled={!canManage}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/50 disabled:bg-muted/50 disabled:text-muted-foreground"
            />
            {fieldErrors.title && <p className="mt-1 text-xs text-destructive">{fieldErrors.title[0]}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Description</label>
            <textarea
              disabled={!canManage}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/50 disabled:bg-muted/50 disabled:text-muted-foreground resize-none"
            />
            {fieldErrors.description && <p className="mt-1 text-xs text-destructive">{fieldErrors.description[0]}</p>}
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Parent Project</label>
              <input
                type="text"
                disabled
                value={task.projectName || "Unknown project"}
                className="w-full rounded-xl border border-border bg-muted/50 px-4 py-2.5 text-sm outline-none text-muted-foreground"
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Due Date</label>
              <input
                type="date"
                disabled={!canManage}
                min={selectedProject?.startDate && new Date(selectedProject.startDate).toISOString().split("T")[0] > todayStr ? new Date(selectedProject.startDate).toISOString().split("T")[0] : todayStr}
                max={selectedProject?.endDate ? new Date(selectedProject.endDate).toISOString().split("T")[0] : undefined}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/50 disabled:bg-muted/50 disabled:text-muted-foreground"
              />
            </div>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 border-t border-border/50 pt-6">
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
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                <span>Task Progress</span>
                <span className="font-bold text-primary">{progress}%</span>
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
                  className="w-full accent-primary h-1.5 rounded bg-muted outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {!canEditStatus && (
            <div className="rounded-xl bg-amber-500/10 p-3 text-sm text-amber-600 dark:text-amber-400 border border-amber-500/20">
              This task is assigned to another team member. You can only view it.
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6 border-t border-border/50 pt-6">
            <Link
              href="/dashboard/tasks"
              className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              Back
            </Link>
            {canEditStatus && (
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50"
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
