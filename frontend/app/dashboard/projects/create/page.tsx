"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SelectDropdown } from "@/components/ui/SelectDropdown";

interface ManagerOption {
  id: number;
  name: string;
  role: string;
}

export default function CreateProjectPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [fetchingManagers, setFetchingManagers] = useState(false);
  const [managers, setManagers] = useState<ManagerOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("PLANNING");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [managerId, setManagerId] = useState<string>("");

  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalDateString();

  useEffect(() => {
    // Fetch managers list only if user is Admin (PM doesn't need to choose)
    const fetchManagers = async () => {
      if (user?.role !== "ADMIN") return;
      try {
        setFetchingManagers(true);
        const response = await api.get("/admin/users");
        const allUsers = Array.isArray(response.data) ? response.data : response.data.users || [];
        // Filter users who can manage projects (ADMIN or PROJECT_MANAGER)
        const eligibleManagers = allUsers.filter(
          (u: any) => u.role === "ADMIN" || u.role === "PROJECT_MANAGER"
        );
        setManagers(eligibleManagers);
      } catch (err) {
        console.error("Failed to load eligible managers list", err);
      } finally {
        setFetchingManagers(false);
      }
    };

    fetchManagers();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});

    // Validate dates
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setError("Start date cannot be after the end date.");
      setLoading(false);
      return;
    }

    try {
      const payload: any = {
        name,
        description: description || null,
        status,
        startDate: startDate || null,
        endDate: endDate || null,
      };

      if (user?.role === "ADMIN") {
        if (!managerId) {
          setError("Please select a project manager.");
          setLoading(false);
          return;
        }
        payload.managerId = parseInt(managerId, 10);
      } else if (user) {
        payload.managerId = user.id;
      }

      await api.post("/projects", payload);
      router.push("/dashboard/projects");
    } catch (err: any) {
      const errData = err.response?.data;
      if (errData?.errors) {
        setFieldErrors(errData.errors);
      } else {
        setError(errData?.error || "Failed to create project.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["ADMIN", "PROJECT_MANAGER"]}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back and Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">New Project</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Initialize a new project, configure dates, and define members.</p>
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
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Project Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="E.g. Web App Redesign"
                className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-indigo-500"
              />
              {fieldErrors.name && <p className="mt-1 text-xs text-red-500">{fieldErrors.name[0]}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="E.g. Detailed redesign roadmap using nextjs and tailwind..."
                rows={4}
                className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-indigo-500"
              />
              {fieldErrors.description && <p className="mt-1 text-xs text-red-500">{fieldErrors.description[0]}</p>}
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  min={todayStr}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
                />
                {fieldErrors.startDate && <p className="mt-1 text-xs text-red-500">{fieldErrors.startDate[0]}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || todayStr}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 dark:border-zinc-800 dark:bg-zinc-950"
                />
                {fieldErrors.endDate && <p className="mt-1 text-xs text-red-500">{fieldErrors.endDate[0]}</p>}
              </div>
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <SelectDropdown
                label="Project Status"
                value={status}
                onChange={setStatus}
                options={[
                  { value: "PLANNING", label: "Planning" },
                  { value: "ACTIVE", label: "Active" },
                  { value: "ON_HOLD", label: "On Hold" },
                  { value: "COMPLETED", label: "Completed" }
                ]}
              />

              {user?.role === "ADMIN" && (
                <div>
                  {fetchingManagers ? (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Project Manager</label>
                      <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-850"></div>
                    </div>
                  ) : (
                    <SelectDropdown
                      label="Project Manager"
                      value={managerId}
                      onChange={setManagerId}
                      placeholder="Select Manager"
                      options={managers.map((manager) => ({
                        value: manager.id,
                        label: `${manager.name} (${manager.role.replace("_", " ").toLowerCase()})`
                      }))}
                    />
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <Link
                href="/dashboard/projects"
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
              >
                {loading ? "Initializing..." : "Create Project"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
