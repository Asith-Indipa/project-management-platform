"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaskStatus = exports.updateTaskProgress = exports.getSingleTask = exports.getMyTasks = exports.getMyProjects = void 0;
const prisma_1 = require("../config/prisma");
const client_1 = require("@prisma/client");
const extra_service_1 = require("./extra.service");
const getMyProjects = async (userId) => {
    return prisma_1.prisma.project.findMany({
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
exports.getMyProjects = getMyProjects;
const getMyTasks = async (userId) => {
    return prisma_1.prisma.task.findMany({
        where: {
            assignedToId: userId,
        },
        select: {
            id: true,
            title: true,
            status: true,
            progress: true,
            dueDate: true,
        },
    });
};
exports.getMyTasks = getMyTasks;
const getSingleTask = async (id, userId) => {
    const task = await prisma_1.prisma.task.findUnique({
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
exports.getSingleTask = getSingleTask;
const updateTaskProgress = async (id, userId, progress) => {
    const task = await prisma_1.prisma.task.findUnique({
        where: { id },
    });
    if (!task) {
        throw new Error("Task not found");
    }
    if (task.assignedToId !== userId) {
        throw new Error("Access denied. You can only update progress of tasks assigned to you.");
    }
    // Automatic Status Update Logic based on progress
    let status = client_1.TaskStatus.IN_PROGRESS;
    if (progress === 0) {
        status = client_1.TaskStatus.TODO;
    }
    else if (progress === 100) {
        status = client_1.TaskStatus.DONE;
    }
    const updatedTask = await prisma_1.prisma.task.update({
        where: { id },
        data: {
            progress,
            status,
        },
    });
    await (0, extra_service_1.logActivity)(`calibrated Task "${task.title}" progress to ${progress}%`, userId, task.projectId);
    return updatedTask;
};
exports.updateTaskProgress = updateTaskProgress;
const updateTaskStatus = async (id, userId, status) => {
    const task = await prisma_1.prisma.task.findUnique({
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
    if (status === client_1.TaskStatus.TODO) {
        progress = 0;
    }
    else if (status === client_1.TaskStatus.DONE) {
        progress = 100;
    }
    else if (status === client_1.TaskStatus.IN_PROGRESS) {
        if (task.progress === 0 || task.progress === 100) {
            progress = 50;
        }
    }
    const updatedTask = await prisma_1.prisma.task.update({
        where: { id },
        data: {
            status,
            progress,
        },
    });
    await (0, extra_service_1.logActivity)(`calibrated Task "${task.title}" status to ${status}`, userId, task.projectId);
    return updatedTask;
};
exports.updateTaskStatus = updateTaskStatus;
