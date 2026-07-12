"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Briefcase, ChevronRight } from "lucide-react";

interface Project {
  id: number;
  name: string;
  status: "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED";
}

export default function MyProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyProjects = async () => {
      try {
        setLoading(true);
        const response = await api.get("/team-member/projects");
        setProjects(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load assigned projects.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyProjects();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400";
      case "PLANNING":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400";
      case "ON_HOLD":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400";
      case "COMPLETED":
      default:
        return "bg-zinc-100 text-zinc-650 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400";
    }
  };

  return (
    <ProtectedRoute allowedRoles={["TEAM_MEMBER", "ADMIN", "PROJECT_MANAGER"]}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">My Assigned Projects</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            List of active projects where you are assigned as a member.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm font-medium text-red-700 dark:bg-red-950/20 dark:text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800"></div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white py-12 text-center dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">You are not assigned to any projects at the moment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-950">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Project ID</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Project Name</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-zinc-50/55 dark:hover:bg-zinc-800/40">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-zinc-500 dark:text-zinc-400">
                      #{project.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-50">
                        <Briefcase className="h-4 w-4 text-indigo-500" />
                        {project.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-semibold ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className="inline-flex items-center gap-0.5 text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 font-semibold"
                      >
                        Inspect <ChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
