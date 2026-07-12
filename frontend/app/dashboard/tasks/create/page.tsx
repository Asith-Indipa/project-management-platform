"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ProjectOption {
  id: number;
  name: string;
  members: {
    userId: number;
    user: {
      id: number;
      name: string;
      role: string;
    };
  }[];
}

export default function CreateTaskPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [fetchingProjects, setFetchingProjects] = useState(true);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [projectId, setProjectId] = useState<string>("");
  const [assignedToId, setAssignedToId] = useState<string>("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setFetchingProjects(true);
        const response = await api.get("/projects");
        setProjects(response.data);
      } catch (err) {
        console.error("Failed to load project list for task assignment", err);
      } finally {
        setFetchingProjects(false);
      }
    };

    fetchProjects();
  }, []);

  // Find currently selected project details to get its members
  const selectedProject = projects.find((p) => p.id === parseInt(projectId, 10));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    if (!projectId) {
      setError("Please select a project.");
      setLoading(false);
      return;
    }

    try {
      const payload: any = {
        title,
        description: description || null,
        priority,
        projectId: parseInt(projectId, 10),
        dueDate: dueDate || null,
      };

      if (assignedToId) {
        payload.assignedToId = parseInt(assignedToId, 10);
      }

      await api.post("/tasks", payload);
      router.push("/dashboard/tasks");
    } catch (err: any) {
      const errData = err.response?.data;
      if (errData?.errors) {
        setFieldErrors(errData.errors);
      } else {
        setError(errData?.error || "Failed to create task.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["ADMIN", "PROJECT_MANAGER"]}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/tasks"
            className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Create Task</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Initialize a task, select its parent project, and allocate to resources.</p>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm font-medium text-red-700 dark:bg-red-950/20 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Card Form */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Task Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g. Setup database schema"
                className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-zinc-800 dark:bg-zinc-950"
              />
              {fieldErrors.title && <p className="mt-1 text-xs text-red-500">{fieldErrors.title[0]}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter task detailed descriptions..."
                rows={4}
                className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-zinc-800 dark:bg-zinc-950"
              />
              {fieldErrors.description && <p className="mt-1 text-xs text-red-500">{fieldErrors.description[0]}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Select Project</label>
                {fetchingProjects ? (
                  <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-850"></div>
                ) : (
                  <select
                    value={projectId}
                    onChange={(e) => {
                      setProjectId(e.target.value);
                      setAssignedToId(""); // reset assignee since project changed
                    }}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <option value="">Choose Project</option>
                    {projects.map((proj) => (
                      <option key={proj.id} value={proj.id}>
                        {proj.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Assignee</label>
                <select
                  value={assignedToId}
                  onChange={(e) => setAssignedToId(e.target.value)}
                  disabled={!projectId}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <option value="">Select Member</option>
                  {selectedProject?.members?.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.user.name} ({m.user.role.replace("_", " ")})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-950"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <Link
                href="/dashboard/tasks"
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Task"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
