"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = exports.checkAndUpdateProjectCompletion = exports.markAsRead = exports.getMyNotifications = exports.sendNotification = exports.getProjectActivities = exports.getSystemActivities = exports.logActivity = void 0;
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
const getSystemActivities = async (userId, role) => {
    let whereClause = {};
    if (role === "PROJECT_MANAGER") {
        whereClause = {
            project: {
                managerId: userId,
            },
        };
    }
    else if (role === "TEAM_MEMBER") {
        whereClause = {
            project: {
                members: {
                    some: {
                        userId: userId,
                    },
                },
            },
        };
    }
    return prisma_1.prisma.activity.findMany({
        where: whereClause,
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
const getMyNotifications = async (userId, role) => {
    if (role === "ADMIN") {
        return prisma_1.prisma.notification.findMany({
            orderBy: { createdAt: "desc" },
            take: 50,
        });
    }
    return prisma_1.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 30,
    });
};
exports.getMyNotifications = getMyNotifications;
const markAsRead = async (notificationId, userId, role) => {
    const notification = await prisma_1.prisma.notification.findUnique({
        where: { id: notificationId },
    });
    if (!notification) {
        throw new Error("Notification not found");
    }
    if (role !== "ADMIN" && notification.userId !== userId) {
        throw new Error("Access denied. You cannot read this notification.");
    }
    return prisma_1.prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
    });
};
exports.markAsRead = markAsRead;
const checkAndUpdateProjectCompletion = async (projectId) => {
    try {
        const totalTasks = await prisma_1.prisma.task.count({
            where: { projectId },
        });
        if (totalTasks === 0)
            return;
        const incompleteTasksCount = await prisma_1.prisma.task.count({
            where: {
                projectId,
                OR: [
                    { status: { not: "DONE" } },
                    { progress: { lt: 100 } }
                ]
            }
        });
        const todoTasksCount = await prisma_1.prisma.task.count({
            where: {
                projectId,
                status: "TODO",
                progress: 0,
            }
        });
        const project = await prisma_1.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project)
            return;
        if (incompleteTasksCount === 0) {
            if (project.status !== "COMPLETED") {
                const updatedProject = await prisma_1.prisma.project.update({
                    where: { id: projectId },
                    data: { status: "COMPLETED" },
                });
                await (0, exports.logActivity)(`automatically marked Project "${updatedProject.name}" as COMPLETED because all tasks are finished`, project.managerId, projectId);
                const members = await prisma_1.prisma.projectMember.findMany({ where: { projectId } });
                await (0, exports.sendNotification)(`Project "${updatedProject.name}" has been automatically completed as all tasks are 100% finished!`, project.managerId);
                for (const m of members) {
                    await (0, exports.sendNotification)(`Project "${updatedProject.name}" has been automatically completed as all tasks are 100% finished!`, m.userId);
                }
            }
        }
        else if (todoTasksCount === totalTasks) {
            if (project.status !== "PLANNING") {
                const updatedProject = await prisma_1.prisma.project.update({
                    where: { id: projectId },
                    data: { status: "PLANNING" },
                });
                await (0, exports.logActivity)(`automatically marked Project "${updatedProject.name}" as PLANNING because all tasks are in TODO state`, project.managerId, projectId);
                const members = await prisma_1.prisma.projectMember.findMany({ where: { projectId } });
                await (0, exports.sendNotification)(`Project "${updatedProject.name}" status reverted to PLANNING because all tasks are in TODO state.`, project.managerId);
                for (const m of members) {
                    await (0, exports.sendNotification)(`Project "${updatedProject.name}" status reverted to PLANNING because all tasks are in TODO state.`, m.userId);
                }
            }
        }
        else {
            if (project.status === "COMPLETED" || project.status === "PLANNING") {
                const updatedProject = await prisma_1.prisma.project.update({
                    where: { id: projectId },
                    data: { status: "ACTIVE" },
                });
                await (0, exports.logActivity)(`automatically marked Project "${updatedProject.name}" as ACTIVE because some tasks have started`, project.managerId, projectId);
                const members = await prisma_1.prisma.projectMember.findMany({ where: { projectId } });
                await (0, exports.sendNotification)(`Project "${updatedProject.name}" status changed to ACTIVE because tasks have started.`, project.managerId);
                for (const m of members) {
                    await (0, exports.sendNotification)(`Project "${updatedProject.name}" status changed to ACTIVE because tasks have started.`, m.userId);
                }
            }
        }
    }
    catch (error) {
        console.error("checkAndUpdateProjectCompletion failed:", error);
    }
};
exports.checkAndUpdateProjectCompletion = checkAndUpdateProjectCompletion;
const getUsers = async () => {
    return prisma_1.prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
        },
    });
};
exports.getUsers = getUsers;
