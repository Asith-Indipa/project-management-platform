"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SelectDropdown } from "@/components/ui/SelectDropdown";

interface ProjectOption {
  id: number;
  name: string;
  startDate: string | null;
  endDate: string | null;
  manager?: {
    id: number;
    name: string;
    email: string;
    role: string;
  } | null;
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

  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalDateString();

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
            className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-border glass-card text-muted-foreground hover:text-foreground transition-colors shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Create Task</h1>
            <p className="text-sm text-muted-foreground">Initialize a task, select its parent project, and allocate to resources.</p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-destructive/10 p-4 text-sm font-medium text-destructive border border-destructive/20 shadow-sm">
            {error}
          </div>
        )}

        {/* Card Form */}
        <div className="rounded-2xl border border-border glass-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Task Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g. Setup database schema"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/50"
              />
              {fieldErrors.title && <p className="mt-1 text-xs text-destructive">{fieldErrors.title[0]}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter task detailed descriptions..."
                rows={4}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/50 resize-none"
              />
              {fieldErrors.description && <p className="mt-1 text-xs text-destructive">{fieldErrors.description[0]}</p>}
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div>
                {fetchingProjects ? (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Project</label>
                    <div className="h-10 w-full animate-pulse rounded-xl bg-muted"></div>
                  </div>
                ) : (
                  <SelectDropdown
                    label="Select Project"
                    value={projectId}
                    onChange={(val) => {
                      setProjectId(val);
                      setAssignedToId(""); // reset assignee since project changed
                    }}
                    placeholder="Choose Project"
                    options={projects.map((proj) => ({
                      value: proj.id,
                      label: proj.name
                    }))}
                  />
                )}
              </div>

              <SelectDropdown
                label="Assignee"
                value={assignedToId}
                onChange={setAssignedToId}
                placeholder="Select Member"
                disabled={!projectId}
                options={[
                  ...(selectedProject?.manager ? [{
                    value: selectedProject.manager.id,
                    label: `${selectedProject.manager.name} (project manager)`
                  }] : []),
                  ...(selectedProject?.members?.map((m) => ({
                    value: m.userId,
                    label: `${m.user.name} (${m.user.role.replace("_", " ").toLowerCase()})`
                  })) || [])
                ]}
              />
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <SelectDropdown
                label="Priority"
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
                  min={selectedProject?.startDate && new Date(selectedProject.startDate).toISOString().split("T")[0] > todayStr ? new Date(selectedProject.startDate).toISOString().split("T")[0] : todayStr}
                  max={selectedProject?.endDate ? new Date(selectedProject.endDate).toISOString().split("T")[0] : undefined}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t border-border/50 pt-6">
              <Link
                href="/dashboard/tasks"
                className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50"
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
