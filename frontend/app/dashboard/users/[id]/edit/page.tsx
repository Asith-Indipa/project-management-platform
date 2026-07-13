"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SelectDropdown } from "@/components/ui/SelectDropdown";

export default function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const unwrappedParams = React.use(params);
  const userId = unwrappedParams.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "PROJECT_MANAGER" | "TEAM_MEMBER" | "">("");

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/admin/users/${userId}`);
        const user = response.data;
        setName(user.name);
        setEmail(user.email);
        setRole(user.role);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to fetch user details.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setFieldErrors({});

    try {
      await api.put(`/admin/users/${userId}`, { name, email, role });
      router.push("/dashboard/users");
    } catch (err: any) {
      const errData = err.response?.data;
      if (errData?.errors) {
        setFieldErrors(errData.errors);
      } else {
        setError(errData?.error || "Failed to update user details.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Button and Title */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/users"
            className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Edit User</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Modify user profile details and access role settings.</p>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm font-medium text-red-700 dark:bg-red-950/20 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Card Form */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {loading ? (
            <div className="space-y-4">
              <div className="h-10 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800"></div>
              <div className="h-10 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800"></div>
              <div className="h-10 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-indigo-500 dark:focus:ring-indigo-950"
                />
                {fieldErrors.name && <p className="mt-1 text-xs text-red-500">{fieldErrors.name[0]}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-indigo-500 dark:focus:ring-indigo-950"
                />
                {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email[0]}</p>}
              </div>

              <SelectDropdown
                label="Access Role"
                value={role}
                onChange={(val) => setRole(val as any)}
                options={[
                  { value: "TEAM_MEMBER", label: "Team Member" },
                  { value: "PROJECT_MANAGER", label: "Project Manager" },
                  { value: "ADMIN", label: "Admin" }
                ]}
                error={fieldErrors.role}
              />

              <div className="flex justify-end gap-3 mt-6 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <Link
                  href="/dashboard/users"
                  className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
