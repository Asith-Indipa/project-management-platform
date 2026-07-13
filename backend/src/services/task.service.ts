import { prisma } from "../config/prisma";
import { Role, TaskStatus, TaskPriority } from "@prisma/client";
import { logActivity, sendNotification } from "./extra.service";

export const createTask = async (taskData: any, currentUserId: number, currentUserRole: Role) => {
  const { title, description, priority, projectId, assignedToId, dueDate } = taskData;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { members: true },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // Access Control: Only Admin or the project manager can create tasks
  if (currentUserRole !== Role.ADMIN && project.managerId !== currentUserId) {
    throw new Error("Access denied. You do not have permission to create tasks for this project.");
  }

  if (assignedToId) {
    // Verify that the assigned user exists
    const assignee = await prisma.user.findUnique({
      where: { id: assignedToId },
    });

    if (!assignee) {
      throw new Error("Assignee user not found");
    }

    // Check if assignee is a member of the project
    const isMember = project.members.some((m) => m.userId === assignedToId);
    if (!isMember && assignee.role !== Role.ADMIN && project.managerId !== assignedToId) {
      throw new Error("User must be a member of the project before tasks can be assigned to them.");
    }
  }

  if (dueDate) {
    const taskDueDate = new Date(dueDate);
    if (project.startDate && taskDueDate < new Date(project.startDate)) {
      throw new Error(`Task due date cannot be before project start date (${project.startDate.toISOString().split('T')[0]})`);
    }
    if (project.endDate && taskDueDate > new Date(project.endDate)) {
      throw new Error(`Task due date cannot be after project end date (${project.endDate.toISOString().split('T')[0]})`);
    }
  }

  const task = await prisma.task.create({
    data: {
      title,
      description,
      priority: priority || TaskPriority.MEDIUM,
      projectId,
      assignedToId,
      dueDate: dueDate ? new Date(dueDate) : null,
      status: TaskStatus.TODO,
    },
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  await logActivity(`created Task "${title}" in Project "${project.name}"`, currentUserId, projectId);
  if (assignedToId) {
    await sendNotification(`Task "${title}" in Project "${project.name}" has been assigned to you.`, assignedToId);
  }

  return task;
};

export const getProjectTasks = async (projectId: number, currentUserId: number, currentUserRole: Role) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { members: true },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // Access Control: Check if user is authorized to view project tasks
  if (currentUserRole === Role.PROJECT_MANAGER && project.managerId !== currentUserId) {
    throw new Error("Access denied. You do not manage this project.");
  }

  if (currentUserRole === Role.TEAM_MEMBER) {
    const isMember = project.members.some((m) => m.userId === currentUserId);
    if (!isMember) {
      throw new Error("Access denied. You are not a member of this project.");
    }
  }

  return prisma.task.findMany({
    where: { projectId },
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
};

export const updateTask = async (taskId: number, updateData: any, currentUserId: number, currentUserRole: Role) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: true,
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  // Access Control: Only Admin or the project manager can update task details
  if (currentUserRole !== Role.ADMIN && task.project.managerId !== currentUserId) {
    throw new Error("Access denied. You do not have permission to manage this task.");
  }

  const { title, description, priority, status, assignedToId, dueDate } = updateData;

  // If changing assignee, verify new assignee is a member of the project
  if (assignedToId && assignedToId !== task.assignedToId) {
    const assignee = await prisma.user.findUnique({
      where: { id: assignedToId },
    });
    if (!assignee) {
      throw new Error("Assignee user not found");
    }

    const projectMembers = await prisma.projectMember.findMany({
      where: { projectId: task.projectId },
    });
    const isMember = projectMembers.some((m) => m.userId === assignedToId);
    if (!isMember && assignee.role !== Role.ADMIN && task.project.managerId !== assignedToId) {
      throw new Error("User must be a member of the project before tasks can be assigned to them.");
    }
  }

  if (dueDate) {
    const taskDueDate = new Date(dueDate);
    if (task.project.startDate && taskDueDate < new Date(task.project.startDate)) {
      throw new Error(`Task due date cannot be before project start date (${task.project.startDate.toISOString().split('T')[0]})`);
    }
    if (task.project.endDate && taskDueDate > new Date(task.project.endDate)) {
      throw new Error(`Task due date cannot be after project end date (${task.project.endDate.toISOString().split('T')[0]})`);
    }
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      title: title || undefined,
      description: description !== undefined ? description : undefined,
      priority: priority || undefined,
      status: status || undefined,
      assignedToId: assignedToId !== undefined ? assignedToId : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    },
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  await logActivity(`updated Task "${updatedTask.title}"`, currentUserId, updatedTask.projectId);

  if (assignedToId && assignedToId !== task.assignedToId) {
    await sendNotification(`Task "${updatedTask.title}" has been assigned to you.`, assignedToId);
  }

  return updatedTask;
};

export const deleteTask = async (taskId: number, currentUserId: number, currentUserRole: Role) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: true,
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  // Access Control: Only Admin or the project manager can delete tasks
  if (currentUserRole !== Role.ADMIN && task.project.managerId !== currentUserId) {
    throw new Error("Access denied. You do not have permission to delete this task.");
  }

  await prisma.task.delete({
    where: { id: taskId },
  });

  return { message: "Task deleted successfully" };
};

export const assignTask = async (taskId: number, assignedToId: number, currentUserId: number, currentUserRole: Role) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: { include: { members: true } } },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  // Access Control: Only Admin or the project manager can assign task
  if (currentUserRole !== Role.ADMIN && task.project.managerId !== currentUserId) {
    throw new Error("Access denied. You do not have permission to assign this task.");
  }

  // Verify assignee exists
  const assignee = await prisma.user.findUnique({
    where: { id: assignedToId },
  });

  if (!assignee) {
    throw new Error("Assignee user not found");
  }

  // Check if assignee is a member of the project
  const isMember = task.project.members.some((m) => m.userId === assignedToId);
  if (!isMember && assignee.role !== Role.ADMIN && task.project.managerId !== assignedToId) {
    throw new Error("User must be a member of the project before tasks can be assigned to them.");
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: { assignedToId },
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  await logActivity(`assigned Task "${task.title}" to ${updatedTask.assignedTo?.name}`, currentUserId, task.projectId);
  await sendNotification(`Task "${task.title}" has been assigned to you.`, assignedToId);

  return updatedTask;
};

export const updateTaskStatus = async (taskId: number, status: TaskStatus, currentUserId: number, currentUserRole: Role) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  // Access Control: Admin (any), PM (if manager), Member (if assignee)
  let isAuthorized = false;
  if (currentUserRole === Role.ADMIN) {
    isAuthorized = true;
  } else if (currentUserRole === Role.PROJECT_MANAGER && task.project.managerId === currentUserId) {
    isAuthorized = true;
  } else if (task.assignedToId === currentUserId) {
    isAuthorized = true;
  }

  if (!isAuthorized) {
    throw new Error("Access denied. You do not have permission to update the status of this task.");
  }

  // Automatic Progress Update Logic based on status
  let progress = task.progress;
  if (status === TaskStatus.TODO) {
    progress = 0;
  } else if (status === TaskStatus.DONE) {
    progress = 100;
  } else if (status === TaskStatus.IN_PROGRESS) {
    if (task.progress === 0 || task.progress === 100) {
      progress = 50;
    }
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      status,
      progress,
    },
  });

  await logActivity(`updated Task "${task.title}" status to ${status}`, currentUserId, task.projectId);

  return updatedTask;
};

export const getMyTasks = async (userId: number) => {
  return prisma.task.findMany({
    where: { assignedToId: userId },
    select: {
      id: true,
      title: true,
      status: true,
      progress: true,
      dueDate: true,
    },
  });
};
