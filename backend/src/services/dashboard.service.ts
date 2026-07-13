import { prisma } from "../config/prisma";
import { Role, TaskStatus, ProjectStatus } from "@prisma/client";

export const getAdminStats = async () => {
  const totalUsers = await prisma.user.count();
  const totalProjects = await prisma.project.count();
  const totalTasks = await prisma.task.count();
  const completedTasks = await prisma.task.count({
    where: { status: TaskStatus.DONE },
  });
  const pendingTasks = await prisma.task.count({
    where: {
      status: {
        in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS],
      },
    },
  });
  const activeProjects = await prisma.project.count({
    where: { status: ProjectStatus.ACTIVE },
  });
  const completedProjects = await prisma.project.count({
    where: { status: ProjectStatus.COMPLETED },
  });

  return {
    totalUsers,
    totalProjects,
    totalTasks,
    completedTasks,
    pendingTasks,
    activeProjects,
    completedProjects,
  };
};

export const getManagerStats = async (userId: number) => {
  const projects = await prisma.project.findMany({
    where: { managerId: userId },
    include: {
      members: {
        select: { userId: true },
      },
    },
  });

  const totalProjects = projects.length;

  // Collect unique user IDs of members across managed projects
  const memberIds = new Set<number>();
  projects.forEach((p) => {
    p.members.forEach((m) => memberIds.add(m.userId));
  });
  const totalTeamMembers = memberIds.size;

  const totalTasks = await prisma.task.count({
    where: {
      project: { managerId: userId },
    },
  });

  const completedTasks = await prisma.task.count({
    where: {
      project: { managerId: userId },
      status: TaskStatus.DONE,
    },
  });

  const inProgressTasks = await prisma.task.count({
    where: {
      project: { managerId: userId },
      status: TaskStatus.IN_PROGRESS,
    },
  });

  return {
    totalProjects,
    totalTeamMembers,
    totalTasks,
    completedTasks,
    inProgressTasks,
    myProjects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status,
    })),
  };
};

export const getTeamMemberStats = async (userId: number) => {
  const assignedTasks = await prisma.task.count({
    where: { assignedToId: userId },
  });

  const completedTasks = await prisma.task.count({
    where: {
      assignedToId: userId,
      status: TaskStatus.DONE,
    },
  });

  const pendingTasks = await prisma.task.count({
    where: {
      assignedToId: userId,
      status: {
        in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS],
      },
    },
  });

  const upcomingDeadlines = await prisma.task.findMany({
    where: {
      assignedToId: userId,
      dueDate: {
        gte: new Date(),
      },
      status: {
        not: TaskStatus.DONE,
      },
    },
    orderBy: {
      dueDate: "asc",
    },
    take: 5,
    select: {
      id: true,
      title: true,
      dueDate: true,
      status: true,
      priority: true,
    },
  });

  return {
    assignedTasks,
    completedTasks,
    pendingTasks,
    upcomingDeadlines,
  };
};
