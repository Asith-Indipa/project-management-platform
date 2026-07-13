"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAsRead = exports.getMyNotifications = exports.sendNotification = exports.getProjectActivities = exports.getSystemActivities = exports.logActivity = void 0;
const prisma_1 = require("../config/prisma");
// ============================================================================
// ACTIVITY TIMELINE SERVICES
// ============================================================================
const logActivity = async (description, userId, projectId) => {
    try {
        return await prisma_1.prisma.activity.create({
            data: {
                description,
                userId,
                projectId: projectId || null,
            },
        });
    }
    catch (error) {
        console.error("Activity logging failed:", error);
    }
};
exports.logActivity = logActivity;
const getSystemActivities = async () => {
    return prisma_1.prisma.activity.findMany({
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
exports.getSystemActivities = getSystemActivities;
const getProjectActivities = async (projectId) => {
    return prisma_1.prisma.activity.findMany({
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
exports.getProjectActivities = getProjectActivities;
// ============================================================================
// NOTIFICATION SERVICES
// ============================================================================
const sendNotification = async (message, userId) => {
    try {
        return await prisma_1.prisma.notification.create({
            data: {
                message,
                userId,
            },
        });
    }
    catch (error) {
        console.error("Notification creation failed:", error);
    }
};
exports.sendNotification = sendNotification;
const getMyNotifications = async (userId) => {
    return prisma_1.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 30,
    });
};
exports.getMyNotifications = getMyNotifications;
const markAsRead = async (notificationId, userId) => {
    const notification = await prisma_1.prisma.notification.findUnique({
        where: { id: notificationId },
    });
    if (!notification) {
        throw new Error("Notification not found");
    }
    if (notification.userId !== userId) {
        throw new Error("Access denied. You cannot read this notification.");
    }
    return prisma_1.prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
    });
};
exports.markAsRead = markAsRead;
