import { prisma } from "../config/prisma";
import { TaskStatus } from "@prisma/client";
import { logActivity, checkAndUpdateProjectCompletion } from "./extra.service";

export const getMyProjects = async (userId: number) => {
  return prisma.project.findMany({
    where: {
      members: {
        some: {
          userId: userId,
        },
      },
    },
    select: {
      id: true,
      name: true,
      status: true,
    },
  });
};

export const getMyTasks = async (userId: number) => {
  return prisma.task.findMany({
    where: {
      assignedToId: userId,
    },
    select: {
      id: true,
      title: true,
      status: true,
      progress: true,
      dueDate: true,
      project: {
        select: {
          name: true,
        },
      },
    },
  });
};

export const getSingleTask = async (id: number, userId: number) => {
  const task = await prisma.task.findUnique({
    where: { id },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  if (task.assignedToId !== userId) {
    throw new Error("Access denied. You are not assigned to this task.");
  }

  return task;
};

export const updateTaskProgress = async (id: number, userId: number, progress: number) => {
  const task = await prisma.task.findUnique({
    where: { id },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  if (task.assignedToId !== userId) {
    throw new Error("Access denied. You can only update progress of tasks assigned to you.");
  }

  // Automatic Status Update Logic based on progress
  let status: TaskStatus = TaskStatus.IN_PROGRESS;
  if (progress === 0) {
    status = TaskStatus.TODO;
  } else if (progress === 100) {
    status = TaskStatus.DONE;
  }

  const updatedTask = await prisma.task.update({
    where: { id },
    data: {
      progress,
      status,
    },
  });

  await logActivity(`calibrated Task "${task.title}" progress to ${progress}%`, userId, task.projectId);
  await checkAndUpdateProjectCompletion(task.projectId);

  return updatedTask;
};

export const updateTaskStatus = async (id: number, userId: number, status: TaskStatus) => {
  const task = await prisma.task.findUnique({
    where: { id },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  if (task.assignedToId !== userId) {
    throw new Error("Access denied. You can only update the status of tasks assigned to you.");
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
    where: { id },
    data: {
      status,
      progress,
    },
  });

  await logActivity(`calibrated Task "${task.title}" status to ${status}`, userId, task.projectId);
  await checkAndUpdateProjectCompletion(task.projectId);

  return updatedTask;
};
