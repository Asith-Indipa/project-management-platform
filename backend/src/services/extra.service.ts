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
