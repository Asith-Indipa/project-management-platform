import { prisma } from "../config/prisma";
import { Role } from "@prisma/client";

export const createProject = async (projectData: any) => {
  const { name, description, managerId, startDate, endDate, status } = projectData;

  // Verify that the manager exists and is either an ADMIN or a PROJECT_MANAGER
  const manager = await prisma.user.findUnique({
    where: { id: managerId },
  });

  if (!manager) {
    throw new Error("Manager user not found");
  }

  if (manager.role !== Role.ADMIN && manager.role !== Role.PROJECT_MANAGER) {
    throw new Error("Manager user must have ADMIN or PROJECT_MANAGER role");
  }

  return prisma.project.create({
    data: {
      name,
      description,
      managerId,
      status: status || "PLANNING",
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    },
    include: {
      manager: {
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

export const getAllProjects = async (userId: number, userRole: Role) => {
  let whereClause = {};

  // Admin gets all projects. PM gets only projects they manage.
  // Team Member gets projects they are members of.
  if (userRole === Role.PROJECT_MANAGER) {
    whereClause = { managerId: userId };
  } else if (userRole === Role.TEAM_MEMBER) {
    whereClause = {
      members: {
        some: {
          userId: userId,
        },
      },
    };
  }

  return prisma.project.findMany({
    where: whereClause,
    include: {
      manager: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      },
      tasks: {
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
      },
    },
  });
};

export const getProjectById = async (id: number, userId: number, userRole: Role) => {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      manager: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      },
      tasks: {
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
      },
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // Access Control: check if user has access to view this project
  if (userRole === Role.PROJECT_MANAGER && project.managerId !== userId) {
    throw new Error("Access denied. You do not manage this project.");
  }

  if (userRole === Role.TEAM_MEMBER) {
    const isMember = project.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new Error("Access denied. You are not a member of this project.");
    }
  }

  return project;
};

export const updateProject = async (id: number, userId: number, userRole: Role, updateData: any) => {
  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // Access Control: Only Admin or the Project Manager responsible for this project can update it
  if (userRole !== Role.ADMIN && project.managerId !== userId) {
    throw new Error("Access denied. You do not have permission to update this project.");
  }

  const { name, description, managerId, startDate, endDate, status } = updateData;

  // If changing manager, verify the new manager
  if (managerId && managerId !== project.managerId) {
    const newManager = await prisma.user.findUnique({
      where: { id: managerId },
    });
    if (!newManager) {
      throw new Error("New manager user not found");
    }
    if (newManager.role !== Role.ADMIN && newManager.role !== Role.PROJECT_MANAGER) {
      throw new Error("New manager must have ADMIN or PROJECT_MANAGER role");
    }
  }

  return prisma.project.update({
    where: { id },
    data: {
      name: name || undefined,
      description: description !== undefined ? description : undefined,
      managerId: managerId || undefined,
      status: status || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    },
    include: {
      manager: {
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

export const deleteProject = async (id: number, userId: number, userRole: Role) => {
  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // Access Control: Only Admin or the Project Manager responsible for this project can delete it
  if (userRole !== Role.ADMIN && project.managerId !== userId) {
    throw new Error("Access denied. You do not have permission to delete this project.");
  }

  // Delete all tasks associated with this project first (Prisma transaction / cascade delete)
  await prisma.task.deleteMany({
    where: { projectId: id },
  });

  // Delete all project member relations
  await prisma.projectMember.deleteMany({
    where: { projectId: id },
  });

  await prisma.project.delete({
    where: { id },
  });

  return { message: "Project deleted successfully" };
};

export const assignMember = async (projectId: number, userId: number, currentUserId: number, currentUserRole: Role) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // Access Control: Only Admin or the project manager can assign members
  if (currentUserRole !== Role.ADMIN && project.managerId !== currentUserId) {
    throw new Error("Access denied. You do not have permission to assign members to this project.");
  }

  // Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User to assign not found");
  }

  // Check if already assigned
  const existingMember = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });

  if (existingMember) {
    throw new Error("User is already a member of this project");
  }

  return prisma.projectMember.create({
    data: {
      projectId,
      userId,
    },
    include: {
      user: {
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

export const removeMember = async (projectId: number, userId: number, currentUserId: number, currentUserRole: Role) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // Access Control: Only Admin or the project manager can remove members
  if (currentUserRole !== Role.ADMIN && project.managerId !== currentUserId) {
    throw new Error("Access denied. You do not have permission to remove members from this project.");
  }

  // Verify member record exists
  const existingMember = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });

  if (!existingMember) {
    throw new Error("User is not a member of this project");
  }

  await prisma.projectMember.delete({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });

  return { message: "Member removed from project successfully" };
};

export const getProjectProgress = async (projectId: number, userId: number, userRole: Role) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { members: true },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // Access Control
  if (userRole === Role.PROJECT_MANAGER && project.managerId !== userId) {
    throw new Error("Access denied. You do not manage this project.");
  }

  if (userRole === Role.TEAM_MEMBER) {
    const isMember = project.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new Error("Access denied. You are not a member of this project.");
    }
  }

  const totalTasks = await prisma.task.count({ where: { projectId } });
  const completedTasks = await prisma.task.count({ where: { projectId, status: "DONE" } });
  const inProgressTasks = await prisma.task.count({ where: { projectId, status: "IN_PROGRESS" } });
  const todoTasks = await prisma.task.count({ where: { projectId, status: "TODO" } });

  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    projectId,
    totalTasks,
    completedTasks,
    inProgressTasks,
    todoTasks,
    completionPercentage,
  };
};

export const getDashboardStats = async (userId: number, userRole: Role) => {
  let whereClause = {};

  if (userRole === Role.PROJECT_MANAGER) {
    whereClause = { managerId: userId };
  } else if (userRole === Role.TEAM_MEMBER) {
    whereClause = {
      members: {
        some: {
          userId,
        },
      },
    };
  }

  const totalProjects = await prisma.project.count({ where: whereClause });
  const activeProjects = await prisma.project.count({ where: { ...whereClause, status: "ACTIVE" } });
  const completedProjects = await prisma.project.count({ where: { ...whereClause, status: "COMPLETED" } });
  const onHoldProjects = await prisma.project.count({ where: { ...whereClause, status: "ON_HOLD" } });

  return {
    totalProjects,
    activeProjects,
    completedProjects,
    onHoldProjects,
  };
};
