import { prisma } from "../config/prisma";

// ============================================================================
// ACTIVITY TIMELINE SERVICES
// ============================================================================

export const logActivity = async (description: string, userId: number, projectId?: number) => {
  try {
    return await prisma.activity.create({
      data: {
        description,
        userId,
        projectId: projectId || null,
      },
    });
  } catch (error) {
    console.error("Activity logging failed:", error);
  }
};

export const getSystemActivities = async () => {
  return prisma.activity.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      user: {
        select: { id: true, name: true, role: true },
      },
      project: {
        select: { id: true, name: true },
      },
    },
  });
};

export const getProjectActivities = async (projectId: number) => {
  return prisma.activity.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    take: 15,
    include: {
      user: {
        select: { id: true, name: true },
      },
    },
  });
};

// ============================================================================
// NOTIFICATION SERVICES
// ============================================================================

export const sendNotification = async (message: string, userId: number) => {
  try {
    return await prisma.notification.create({
      data: {
        message,
        userId,
      },
    });
  } catch (error) {
    console.error("Notification creation failed:", error);
  }
};

export const getMyNotifications = async (userId: number) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
};

export const markAsRead = async (notificationId: number, userId: number) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    throw new Error("Notification not found");
  }

  if (notification.userId !== userId) {
    throw new Error("Access denied. You cannot read this notification.");
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
};

export const checkAndUpdateProjectCompletion = async (projectId: number) => {
  try {
    const totalTasks = await prisma.task.count({
      where: { projectId },
    });

    if (totalTasks === 0) return;

    const incompleteTasksCount = await prisma.task.count({
      where: {
        projectId,
        OR: [
          { status: { not: "DONE" } },
          { progress: { lt: 100 } }
        ]
      }
    });

    const todoTasksCount = await prisma.task.count({
      where: {
        projectId,
        status: "TODO",
        progress: 0,
      }
    });

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) return;

    if (incompleteTasksCount === 0) {
      if (project.status !== "COMPLETED") {
        const updatedProject = await prisma.project.update({
          where: { id: projectId },
          data: { status: "COMPLETED" },
        });

        await logActivity(`automatically marked Project "${updatedProject.name}" as COMPLETED because all tasks are finished`, project.managerId, projectId);

        const members = await prisma.projectMember.findMany({ where: { projectId } });
        for (const m of members) {
          await sendNotification(`Project "${updatedProject.name}" has been automatically completed as all tasks are 100% finished!`, m.userId);
        }
      }
    } else if (todoTasksCount === totalTasks) {
      if (project.status !== "PLANNING") {
        const updatedProject = await prisma.project.update({
          where: { id: projectId },
          data: { status: "PLANNING" },
        });

        await logActivity(`automatically marked Project "${updatedProject.name}" as PLANNING because all tasks are in TODO state`, project.managerId, projectId);

        const members = await prisma.projectMember.findMany({ where: { projectId } });
        for (const m of members) {
          await sendNotification(`Project "${updatedProject.name}" status reverted to PLANNING because all tasks are in TODO state.`, m.userId);
        }
      }
    } else {
      if (project.status === "COMPLETED" || project.status === "PLANNING") {
        const updatedProject = await prisma.project.update({
          where: { id: projectId },
          data: { status: "ACTIVE" },
        });

        await logActivity(`automatically marked Project "${updatedProject.name}" as ACTIVE because some tasks have started`, project.managerId, projectId);

        const members = await prisma.projectMember.findMany({ where: { projectId } });
        for (const m of members) {
          await sendNotification(`Project "${updatedProject.name}" status changed to ACTIVE because tasks have started.`, m.userId);
        }
      }
    }
  } catch (error) {
    console.error("checkAndUpdateProjectCompletion failed:", error);
  }
};
