"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeamMemberStats = exports.getManagerStats = exports.getAdminStats = void 0;
const prisma_1 = require("../config/prisma");
const client_1 = require("@prisma/client");
const getAdminStats = async () => {
    const totalUsers = await prisma_1.prisma.user.count();
    const totalProjects = await prisma_1.prisma.project.count();
    const totalTasks = await prisma_1.prisma.task.count();
    const completedTasks = await prisma_1.prisma.task.count({
        where: { status: client_1.TaskStatus.DONE },
    });
    const pendingTasks = await prisma_1.prisma.task.count({
        where: {
            status: {
                in: [client_1.TaskStatus.TODO, client_1.TaskStatus.IN_PROGRESS],
            },
        },
    });
    const activeProjects = await prisma_1.prisma.project.count({
        where: { status: client_1.ProjectStatus.ACTIVE },
    });
    return {
        totalUsers,
        totalProjects,
        totalTasks,
        completedTasks,
        pendingTasks,
        activeProjects,
    };
};
exports.getAdminStats = getAdminStats;
const getManagerStats = async (userId) => {
    const projects = await prisma_1.prisma.project.findMany({
        where: { managerId: userId },
        include: {
            members: {
                select: { userId: true },
            },
        },
    });
    const totalProjects = projects.length;
    // Collect unique user IDs of members across managed projects
    const memberIds = new Set();
    projects.forEach((p) => {
        p.members.forEach((m) => memberIds.add(m.userId));
    });
    const totalTeamMembers = memberIds.size;
    const totalTasks = await prisma_1.prisma.task.count({
        where: {
            project: { managerId: userId },
        },
    });
    const completedTasks = await prisma_1.prisma.task.count({
        where: {
            project: { managerId: userId },
            status: client_1.TaskStatus.DONE,
        },
    });
    const inProgressTasks = await prisma_1.prisma.task.count({
        where: {
            project: { managerId: userId },
            status: client_1.TaskStatus.IN_PROGRESS,
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
exports.getManagerStats = getManagerStats;
const getTeamMemberStats = async (userId) => {
    const assignedTasks = await prisma_1.prisma.task.count({
        where: { assignedToId: userId },
    });
    const completedTasks = await prisma_1.prisma.task.count({
        where: {
            assignedToId: userId,
            status: client_1.TaskStatus.DONE,
        },
    });
    const pendingTasks = await prisma_1.prisma.task.count({
        where: {
            assignedToId: userId,
            status: {
                in: [client_1.TaskStatus.TODO, client_1.TaskStatus.IN_PROGRESS],
            },
        },
    });
    const upcomingDeadlines = await prisma_1.prisma.task.findMany({
        where: {
            assignedToId: userId,
            dueDate: {
                gte: new Date(),
            },
            status: {
                not: client_1.TaskStatus.DONE,
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
exports.getTeamMemberStats = getTeamMemberStats;
