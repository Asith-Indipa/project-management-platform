"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import {
  ArrowLeft,
  Calendar,
  Users,
  CheckSquare,
  Plus,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  UserPlus,
  Play,
  Edit,
} from "lucide-react";

interface ProjectMember {
  userId: number;
  user: {
    id: number;
    name: string;
    email: string;
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
  assignedTo: {
    id: number;
    name: string;
    email: string;
  } | null;
}

interface Project {
  id: number;
  name: string;
  description: string | null;
  status: "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED";
  startDate: string | null;
  endDate: string | null;
  manager: {
    id: number;
    name: string;
    email: string;
  };
  members: ProjectMember[];
  tasks: Task[];
}

export default function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const unwrappedParams = React.use(params);
  const projectId = parseInt(unwrappedParams.id, 10);

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<"tasks" | "members">("tasks");
  const [isAssignMemberOpen, setIsAssignMemberOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isDeleteMemberOpen, setIsDeleteMemberOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(null);

  // Member Form state
  const [globalUsers, setGlobalUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [manualUserId, setManualUserId] = useState("");
  const [assigningMember, setAssigningMember] = useState(false);

  // Task Form state
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskPriority, setTaskPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskAssigneeId, setTaskAssigneeId] = useState("");
  const [creatingTask, setCreatingTask] = useState(false);
  const [taskErrors, setTaskErrors] = useState<Record<string, string[]>>({});

  // Edit Project state
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("PLANNING");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editManagerId, setEditManagerId] = useState("");
  const [updatingProject, setUpdatingProject] = useState(false);
  const [editErrors, setEditErrors] = useState<Record<string, string[]>>({});
  const [managers, setManagers] = useState<any[]>([]);
  const [fetchingManagers, setFetchingManagers] = useState(false);
  const [isDeleteProjectOpen, setIsDeleteProjectOpen] = useState(false);

  const openEditProjectModal = () => {
    if (!project) return;
    setEditName(project.name);
    setEditDescription(project.description || "");
    setEditStatus(project.status);
    setEditStartDate(project.startDate ? new Date(project.startDate).toISOString().split("T")[0] : "");
    setEditEndDate(project.endDate ? new Date(project.endDate).toISOString().split("T")[0] : "");
    setEditManagerId(project.manager?.id.toString() || "");
    setEditErrors({});
    setIsEditProjectOpen(true);
  };

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/projects/${projectId}`);
      setProject(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load project details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  // Load global users if admin or project manager
  useEffect(() => {
    if (isAssignMemberOpen) {
      const url = currentUser?.role === "ADMIN" ? "/admin/users" : "/users";
      api.get(url)
        .then((res) => {
          const list = Array.isArray(res.data) ? res.data : res.data.users || [];
          setGlobalUsers(list);
        })
        .catch(console.error);
    }
  }, [isAssignMemberOpen, currentUser]);

  useEffect(() => {
    if (isEditProjectOpen && currentUser?.role === "ADMIN") {
      setFetchingManagers(true);
      api.get("/admin/users")
        .then((res) => {
          const allUsers = Array.isArray(res.data) ? res.data : res.data.users || [];
          const eligibleManagers = allUsers.filter(
            (u: any) => u.role === "ADMIN" || u.role === "PROJECT_MANAGER"
          );
          setManagers(eligibleManagers);
        })
        .catch(console.error)
        .finally(() => setFetchingManagers(false));
    }
  }, [isEditProjectOpen, currentUser]);

  const handleAssignMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssigningMember(true);
    setError(null);
    setSuccess(null);

    const targetId = selectedUserId;

    if (!targetId) {
      setError("Please specify a user to assign.");
      setAssigningMember(false);
      return;
    }

    try {
      await api.post(`/projects/${projectId}/members`, {
        userId: parseInt(targetId, 10),
      });
      setSuccess("Member assigned successfully!");
      setIsAssignMemberOpen(false);
      setSelectedUserId("");
      setManualUserId("");
      fetchProjectDetails();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to assign member.");
    } finally {
      setAssigningMember(false);
    }
  };

  const openDeleteMemberModal = (member: ProjectMember) => {
    setMemberToRemove(member);
    setIsDeleteMemberOpen(true);
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;
    setError(null);
    setSuccess(null);
    try {
      await api.delete(`/projects/${projectId}/members/${memberToRemove.userId}`);
      setSuccess("Member removed from project.");
      setIsDeleteMemberOpen(false);
      setMemberToRemove(null);
      fetchProjectDetails();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to remove member.");
      setIsDeleteMemberOpen(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingTask(true);
    setTaskErrors({});
    setError(null);

    try {
      const payload: any = {
        title: taskTitle,
        description: taskDesc || null,
        priority: taskPriority,
        dueDate: taskDueDate || null,
        projectId,
      };

      if (taskAssigneeId) {
        payload.assignedToId = parseInt(taskAssigneeId, 10);
      }

      await api.post("/tasks", payload);
      setSuccess("Task created successfully!");
      setIsCreateTaskOpen(false);
      resetTaskForm();
      fetchProjectDetails();
    } catch (err: any) {
      const errData = err.response?.data;
      if (errData?.errors) {
        setTaskErrors(errData.errors);
      } else {
        setError(errData?.error || "Failed to create task.");
      }
    } finally {
      setCreatingTask(false);
    }
  };

  const resetTaskForm = () => {
    setTaskTitle("");
    setTaskDesc("");
    setTaskPriority("MEDIUM");
    setTaskDueDate("");
    setTaskAssigneeId("");
    setTaskErrors({});
  };

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProject(true);
    setEditErrors({});
    setError(null);
    setSuccess(null);

    if (editStartDate && editEndDate && new Date(editStartDate) > new Date(editEndDate)) {
      setError("Start date cannot be after the end date.");
      setUpdatingProject(false);
      return;
    }

    try {
      const payload: any = {
        name: editName,
        description: editDescription || null,
        status: editStatus,
        startDate: editStartDate || null,
        endDate: editEndDate || null,
      };

      if (currentUser?.role === "ADMIN") {
        if (!editManagerId) {
          setError("Please select a project manager.");
          setUpdatingProject(false);
          return;
        }
        payload.managerId = parseInt(editManagerId, 10);
      }

      await api.put(`/projects/${projectId}`, payload);
      setSuccess("Project updated successfully!");
      setIsEditProjectOpen(false);
      fetchProjectDetails();
    } catch (err: any) {
      const errData = err.response?.data;
      if (errData?.errors) {
        setEditErrors(errData.errors);
      } else {
        setError(errData?.error || "Failed to update project.");
      }
    } finally {
      setUpdatingProject(false);
    }
  };

  const handleDeleteProject = async () => {
    setUpdatingProject(true);
    setError(null);
    try {
      await api.delete(`/projects/${projectId}`);
      setIsDeleteProjectOpen(false);
      router.push("/dashboard/projects");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete project.");
      setIsDeleteProjectOpen(false);
    } finally {
      setUpdatingProject(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400";
      case "MEDIUM":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400";
      case "LOW":
      default:
        return "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DONE":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "IN_PROGRESS":
        return <Play className="h-4 w-4 text-indigo-500 animate-pulse" />;
      case "TODO":
      default:
        return <Clock className="h-4 w-4 text-zinc-400" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800"></div>
        <div className="h-32 w-full animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800"></div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="rounded-xl bg-red-50 p-6 text-red-600 dark:bg-red-950/20 dark:text-red-400">
        <h2 className="text-lg font-semibold mb-2">Error Loading Project</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!project) return null;

  // Calculate project completion percentage based on average of task progress
  const totalTasks = project.tasks.length;
  const totalProgress = project.tasks.reduce((sum, t) => sum + (t.progress || 0), 0);
  const progressPercent = totalTasks > 0 ? Math.round(totalProgress / totalTasks) : 0;
  const hasIncompleteTasks = project.tasks.some((t) => t.status !== "DONE" || t.progress < 100);

  const canManage = currentUser?.role === "ADMIN" || currentUser?.role === "PROJECT_MANAGER";

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{project.name}</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Managed by {project.manager?.name}</p>
          </div>
        </div>
        {canManage && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsDeleteProjectOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 shadow-sm transition-all hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/45"
            >
              <Trash2 className="h-4 w-4" /> Delete Project
            </button>
            <button
              onClick={openEditProjectModal}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <Edit className="h-4 w-4" /> Edit Project
            </button>
            <button
              onClick={() => setIsAssignMemberOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <UserPlus className="h-4 w-4" /> Add Member
            </button>
            <button
              onClick={() => setIsCreateTaskOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-indigo-500"
            >
              <Plus className="h-4 w-4" /> Add Task
            </button>
          </div>
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

      {/* Project Overview Card */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-bold mb-2">Description</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {project.description || "No description provided for this project."}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
          <h2 className="text-lg font-bold">Metadata</h2>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Status</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">{project.status}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">Start Date</span>
            <span className="font-semibold">{formatDate(project.startDate)}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500 dark:text-zinc-400">End Date</span>
            <span className="font-semibold text-red-500 dark:text-red-400">{formatDate(project.endDate)}</span>
          </div>

          {/* Progress */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
              <span>Overall Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-600 dark:bg-indigo-400"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("tasks")}
            className={`border-b-2 py-4 px-1 text-sm font-semibold transition-all ${
              activeTab === "tasks"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            <span className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" /> Tasks ({project.tasks.length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab("members")}
            className={`border-b-2 py-4 px-1 text-sm font-semibold transition-all ${
              activeTab === "members"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Members ({project.members.length})
            </span>
          </button>
        </nav>
      </div>

      {/* TAB CONTENT: TASKS */}
      {activeTab === "tasks" && (
        <div className="space-y-4">
          {project.tasks.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-white py-12 text-center dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No tasks created for this project yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {project.tasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/dashboard/tasks/${task.id}`}
                  className="block rounded-xl border border-zinc-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-indigo-200 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{task.title}</h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">{task.description || "No description."}</p>
                    </div>
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                    <div className="flex items-center gap-1">
                      {getStatusIcon(task.status)}
                      <span className="capitalize">{task.status.toLowerCase().replace("_", " ")}</span>
                      <span className="ml-1 font-bold text-zinc-700 dark:text-zinc-300">({task.progress}%)</span>
                    </div>

                    <div>
                      <span>Assignee: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{task.assignedTo?.name || "Unassigned"}</span></span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: MEMBERS */}
      {activeTab === "members" && (
        <div className="space-y-4">
          {project.members.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 bg-white py-12 text-center dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No members assigned to this project.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-950">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Name</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Email</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Role</th>
                    {canManage && (
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 text-right">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {project.members.map((member) => (
                    <tr key={member.userId} className="hover:bg-zinc-50/55 dark:hover:bg-zinc-800/40">
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-zinc-900 dark:text-zinc-50">{member.user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">{member.user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
                          {member.user.role.replace("_", " ")}
                        </span>
                      </td>
                      {canManage && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <button
                            onClick={() => openDeleteMemberModal(member)}
                            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ASSIGN MEMBER MODAL */}
      {isAssignMemberOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsAssignMemberOpen(false)} />
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150 dark:bg-zinc-900 dark:border dark:border-zinc-800">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">Assign Project Member</h2>
            <form onSubmit={handleAssignMember} className="space-y-4">
              <SelectDropdown
                label="Select Member"
                value={selectedUserId}
                onChange={setSelectedUserId}
                placeholder="Choose User"
                options={globalUsers
                  .filter((gu) => !project.members.some((pm) => pm.userId === gu.id))
                  .filter((gu) => currentUser?.role !== "PROJECT_MANAGER" || gu.role === "TEAM_MEMBER")
                  .map((gu) => ({
                    value: gu.id,
                    label: `${gu.name} (${gu.role.replace("_", " ").toLowerCase()})`
                  }))}
              />

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAssignMemberOpen(false)}
                  className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigningMember}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {assigningMember ? "Assigning..." : "Assign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {isCreateTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCreateTaskOpen(false)} />
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150 dark:bg-zinc-900 dark:border dark:border-zinc-800">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">Create New Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Task title..."
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-950"
                />
                {taskErrors.title && <p className="mt-1 text-xs text-red-500">{taskErrors.title[0]}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Description</label>
                <textarea
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Task details..."
                  rows={3}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-805 dark:bg-zinc-950"
                />
                {taskErrors.description && <p className="mt-1 text-xs text-red-500">{taskErrors.description[0]}</p>}
              </div>

              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <SelectDropdown
                  label="Priority"
                  value={taskPriority}
                  onChange={(val) => setTaskPriority(val as any)}
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
                    min={project?.startDate ? new Date(project.startDate).toISOString().split("T")[0] : undefined}
                    max={project?.endDate ? new Date(project.endDate).toISOString().split("T")[0] : undefined}
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-950"
                  />
                </div>
              </div>

              <SelectDropdown
                label="Assign To Member"
                value={taskAssigneeId}
                onChange={setTaskAssigneeId}
                placeholder="Unassigned"
                options={project.members.map((m) => ({
                  value: m.userId,
                  label: `${m.user.name} (${m.user.role.replace("_", " ").toLowerCase()})`
                }))}
              />

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreateTaskOpen(false)}
                  className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTask}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {creatingTask ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REMOVE MEMBER CONFIRMATION MODAL */}
      {isDeleteMemberOpen && memberToRemove && (() => {
        const assignedTasks = project?.tasks.filter((t) => t.assignedTo?.id === memberToRemove.userId) || [];
        const hasAssignedTasks = assignedTasks.length > 0;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsDeleteMemberOpen(false)} />
            <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150 dark:bg-zinc-900 dark:border dark:border-zinc-800">
              {hasAssignedTasks ? (
                <>
                  <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400 mb-3">
                    <AlertCircle className="h-6 w-6" />
                    <h2 className="text-lg font-bold">Unassign Tasks First</h2>
                  </div>
                  <p className="text-sm text-zinc-650 dark:text-zinc-400 mb-4">
                    Before removing <span className="font-semibold text-zinc-900 dark:text-zinc-50">{memberToRemove.user.name}</span>, you must unassign them from the following tasks in this project:
                  </p>
                  
                  <div className="space-y-2.5 max-h-48 overflow-y-auto mb-6 pr-1">
                    {assignedTasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border border-zinc-150 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-950/40 text-xs">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[180px]">{task.title}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              try {
                                await api.put(`/tasks/${task.id}`, { assignedToId: null });
                                fetchProjectDetails();
                              } catch (err: any) {
                                alert("Failed to unassign: " + (err.response?.data?.error || err.message));
                              }
                            }}
                            className="rounded bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/80 dark:text-indigo-400 transition-all"
                          >
                            Unassign
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setIsDeleteMemberOpen(false)}
                      className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      Close
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 text-red-650 dark:text-red-400 mb-3">
                    <AlertCircle className="h-6 w-6" />
                    <h2 className="text-lg font-bold">Remove Member</h2>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                    Are you sure you want to remove <span className="font-semibold text-zinc-900 dark:text-zinc-50">{memberToRemove.user.name}</span> from the project? This action cannot be undone.
                  </p>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsDeleteMemberOpen(false)}
                      className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRemoveMember}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
                    >
                      Yes, Remove
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })()}

      {/* EDIT PROJECT MODAL */}
      {isEditProjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsEditProjectOpen(false)} />
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150 dark:bg-zinc-900 dark:border dark:border-zinc-800">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">Edit Project Details</h2>
            <form onSubmit={handleEditProject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-950"
                />
                {editErrors.name && <p className="mt-1 text-xs text-red-500">{editErrors.name[0]}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-950"
                />
                {editErrors.description && <p className="mt-1 text-xs text-red-500">{editErrors.description[0]}</p>}
              </div>

              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-950"
                  />
                  {editErrors.startDate && <p className="mt-1 text-xs text-red-500">{editErrors.startDate[0]}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">End Date</label>
                  <input
                    type="date"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-950"
                  />
                  {editErrors.endDate && <p className="mt-1 text-xs text-red-500">{editErrors.endDate[0]}</p>}
                </div>
              </div>

              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <SelectDropdown
                  label="Project Status"
                  value={editStatus}
                  onChange={setEditStatus}
                  options={[
                    { value: "PLANNING", label: "Planning" },
                    { value: "ACTIVE", label: "Active" },
                    { value: "ON_HOLD", label: "On Hold" },
                    {
                      value: "COMPLETED",
                      label: hasIncompleteTasks ? "Completed (Incomplete tasks exist)" : "Completed",
                      disabled: hasIncompleteTasks
                    }
                  ]}
                />

                {currentUser?.role === "ADMIN" && (
                  <div>
                    {fetchingManagers ? (
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Project Manager</label>
                        <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-850"></div>
                      </div>
                    ) : (
                      <SelectDropdown
                        label="Project Manager"
                        value={editManagerId}
                        onChange={setEditManagerId}
                        placeholder="Select Manager"
                        options={managers.map((m) => ({
                          value: m.id,
                          label: `${m.name} (${m.role.replace("_", " ").toLowerCase()})`
                        }))}
                      />
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditProjectOpen(false)}
                  className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingProject}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {updatingProject ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE PROJECT MODAL */}
      {isDeleteProjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsDeleteProjectOpen(false)} />
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150 dark:bg-zinc-900 dark:border dark:border-zinc-800">
            <h2 className="text-xl font-bold text-red-650 dark:text-red-400 mb-2">Delete Project?</h2>
            <p className="text-sm text-zinc-550 dark:text-zinc-400 mb-6">
              Are you sure you want to delete <span className="font-semibold text-zinc-850 dark:text-zinc-100">"{project?.name}"</span>? 
              This will permanently delete all associated tasks, activities, and member relationships. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDeleteProjectOpen(false)}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProject}
                disabled={updatingProject}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
              >
                {updatingProject ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
