"use client";

import React, { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { SelectDropdown } from "@/components/ui/SelectDropdown";

interface User {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "PROJECT_MANAGER" | "TEAM_MEMBER";
  createdAt: string;
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Form states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "PROJECT_MANAGER" | "TEAM_MEMBER">("TEAM_MEMBER");
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/users");
      // Adjust if response wrapper structure differs
      setUsers(Array.isArray(response.data) ? response.data : response.data.users || []);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle form submissions
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setError(null);
    try {
      await api.post("/admin/users", { name, email, password, role });
      setSuccess("User created successfully!");
      setIsCreateOpen(false);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      const errData = err.response?.data;
      if (errData?.errors) {
        setFormErrors(errData.errors);
      } else {
        setError(errData?.error || "Failed to create user.");
      }
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setError(null);
    if (!selectedUser) return;

    try {
      await api.put(`/admin/users/${selectedUser.id}`, { name, email, role });
      setSuccess("User updated successfully!");
      setIsEditOpen(false);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      const errData = err.response?.data;
      if (errData?.errors) {
        setFormErrors(errData.errors);
      } else {
        setError(errData?.error || "Failed to update user.");
      }
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setError(null);
    try {
      await api.delete(`/admin/users/${selectedUser.id}`);
      setSuccess("User deleted successfully!");
      setIsDeleteOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete user.");
      setIsDeleteOpen(false);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("TEAM_MEMBER");
    setSelectedUser(null);
    setFormErrors({});
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setIsEditOpen(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  // Filtering & Pagination logic
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">User Management</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Create, edit, or remove system users and manage their global access roles.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                resetForm();
                setIsCreateOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:scale-[1.02]"
            >
              <Plus className="h-4 w-4" /> Add User
            </button>
          </div>
        </div>

        {/* Banners */}
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
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between rounded-2xl border border-border glass-card p-3 shadow-sm relative z-20">
          <div className="relative w-full sm:max-w-xs group">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-border bg-background/50 pl-10 pr-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto bg-background/50 border border-border rounded-xl px-2">
            <Filter className="h-4 w-4 text-muted-foreground ml-2 hidden sm:block" />
            <SelectDropdown
              value={roleFilter}
              onChange={(val) => {
                setRoleFilter(val);
                setCurrentPage(1);
              }}
              className="w-full sm:w-48"
              buttonClassName="border-0 focus:ring-0 bg-transparent shadow-none"
              options={[
                { value: "ALL", label: "All Roles" },
                { value: "ADMIN", label: "Admin" },
                { value: "PROJECT_MANAGER", label: "Project Manager" },
                { value: "TEAM_MEMBER", label: "Team Member" }
              ]}
            />
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800"></div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white py-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No users found matching your search parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border glass-card">
            <table className="min-w-full divide-y divide-border text-left">
              <thead className="bg-muted/30">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted font-bold text-foreground border border-border">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground font-medium">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        user.role === "ADMIN"
                          ? "bg-red-500/10 text-red-600 dark:text-red-400"
                          : user.role === "PROJECT_MANAGER"
                          ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      }`}>
                        {user.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right space-x-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="inline-flex items-center rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      {user.role !== "ADMIN" && user.id !== currentUser?.id && (
                        <button
                          onClick={() => openDeleteModal(user)}
                          className="inline-flex items-center rounded-lg p-2 text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-zinc-200 px-6 py-4 dark:border-zinc-800">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  Showing page {currentPage} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className="inline-flex rounded-lg border border-zinc-200 bg-white p-1 text-zinc-500 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-800"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className="inline-flex rounded-lg border border-zinc-200 bg-white p-1 text-zinc-500 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-800"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CREATE MODAL */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsCreateOpen(false)} />
            <div className="relative w-full max-w-md rounded-2xl border border-border glass-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
              <h2 className="text-xl font-semibold tracking-tight text-foreground mb-6">Create New User</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background/50 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background"
                  />
                  {formErrors.name && <p className="mt-1 text-xs text-destructive">{formErrors.name[0]}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background/50 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background"
                  />
                  {formErrors.email && <p className="mt-1 text-xs text-destructive">{formErrors.email[0]}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background/50 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background"
                  />
                  {formErrors.password && <p className="mt-1 text-xs text-destructive">{formErrors.password[0]}</p>}
                </div>
                  <SelectDropdown
                    label="Role"
                    value={role}
                    onChange={(val) => setRole(val as any)}
                    options={[
                      { value: "TEAM_MEMBER", label: "Team Member" },
                      { value: "PROJECT_MANAGER", label: "Project Manager" },
                      { value: "ADMIN", label: "Admin" }
                    ]}
                    error={formErrors.role}
                  />
                <div className="flex justify-end gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT MODAL */}
        {isEditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsEditOpen(false)} />
            <div className="relative w-full max-w-md rounded-2xl border border-border glass-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
              <h2 className="text-xl font-semibold tracking-tight text-foreground mb-6">Edit User Details</h2>
              <form onSubmit={handleEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background/50 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background"
                  />
                  {formErrors.name && <p className="mt-1 text-xs text-destructive">{formErrors.name[0]}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background/50 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background"
                  />
                  {formErrors.email && <p className="mt-1 text-xs text-destructive">{formErrors.email[0]}</p>}
                </div>
                  <SelectDropdown
                    label="Role"
                    value={role}
                    onChange={(val) => setRole(val as any)}
                    options={[
                      { value: "TEAM_MEMBER", label: "Team Member" },
                      { value: "PROJECT_MANAGER", label: "Project Manager" },
                      { value: "ADMIN", label: "Admin" }
                    ]}
                    error={formErrors.role}
                  />
                <div className="flex justify-end gap-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION DIALOG */}
        {isDeleteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsDeleteOpen(false)} />
            <div className="relative w-full max-w-sm rounded-2xl border border-border glass-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 text-destructive mb-3">
                <AlertTriangle className="h-6 w-6" />
                <h2 className="text-lg font-bold tracking-tight">Confirm Deletion</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-8">
                Are you sure you want to delete user <span className="font-semibold text-foreground">{selectedUser?.name}</span>? This action cannot be undone and will affect any projects or tasks associated with this user.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(false)}
                  className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="rounded-xl bg-destructive px-5 py-2.5 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-sm"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
