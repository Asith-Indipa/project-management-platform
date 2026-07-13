"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyTasks = exports.updateTaskStatus = exports.assignTask = exports.deleteTask = exports.updateTask = exports.getProjectTasks = exports.createTask = void 0;
const prisma_1 = require("../config/prisma");
const client_1 = require("@prisma/client");
const extra_service_1 = require("./extra.service");
const createTask = async (taskData, currentUserId, currentUserRole) => {
    const { title, description, priority, projectId, assignedToId, dueDate } = taskData;
    const project = await prisma_1.prisma.project.findUnique({
        where: { id: projectId },
        include: { members: true },
    });
    if (!project) {
        throw new Error("Project not found");
    }
    // Access Control: Only Admin or the project manager can create tasks
    if (currentUserRole !== client_1.Role.ADMIN && project.managerId !== currentUserId) {
        throw new Error("Access denied. You do not have permission to create tasks for this project.");
    }
    if (assignedToId) {
        // Verify that the assigned user exists
        const assignee = await prisma_1.prisma.user.findUnique({
            where: { id: assignedToId },
        });
        if (!assignee) {
            throw new Error("Assignee user not found");
        }
        // Check if assignee is a member of the project
        const isMember = project.members.some((m) => m.userId === assignedToId);
        if (!isMember && assignee.role !== client_1.Role.ADMIN && project.managerId !== assignedToId) {
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
    const task = await prisma_1.prisma.task.create({
        data: {
            title,
            description,
            priority: priority || client_1.TaskPriority.MEDIUM,
            projectId,
            assignedToId,
            dueDate: dueDate ? new Date(dueDate) : null,
            status: client_1.TaskStatus.TODO,
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
    const actor = await prisma_1.prisma.user.findUnique({ where: { id: currentUserId } });
    const actorText = actor ? `${actor.name} (${actor.role.replace("_", " ").toLowerCase()})` : "System";
    await (0, extra_service_1.logActivity)(`created Task "${title}" in Project "${project.name}"`, currentUserId, projectId);
    if (assignedToId) {
        if (assignedToId !== currentUserId) {
            await (0, extra_service_1.sendNotification)(`Task "${title}" in Project "${project.name}" has been assigned to you by ${actorText}.`, assignedToId);
        }
    }
    return task;
};
exports.createTask = createTask;
const getProjectTasks = async (projectId, currentUserId, currentUserRole) => {
    const project = await prisma_1.prisma.project.findUnique({
        where: { id: projectId },
        include: { members: true },
    });
    if (!project) {
        throw new Error("Project not found");
    }
    // Access Control: Check if user is authorized to view project tasks
    if (currentUserRole === client_1.Role.PROJECT_MANAGER && project.managerId !== currentUserId) {
        throw new Error("Access denied. You do not manage this project.");
    }
    if (currentUserRole === client_1.Role.TEAM_MEMBER) {
        const isMember = project.members.some((m) => m.userId === currentUserId);
        if (!isMember) {
            throw new Error("Access denied. You are not a member of this project.");
        }
    }
    return prisma_1.prisma.task.findMany({
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
exports.getProjectTasks = getProjectTasks;
const updateTask = async (taskId, updateData, currentUserId, currentUserRole) => {
    const task = await prisma_1.prisma.task.findUnique({
        where: { id: taskId },
        include: {
            project: true,
        },
    });
    if (!task) {
        throw new Error("Task not found");
    }
    // Access Control: Only Admin or the project manager can update task details
    if (currentUserRole !== client_1.Role.ADMIN && task.project.managerId !== currentUserId) {
        throw new Error("Access denied. You do not have permission to manage this task.");
    }
    const { title, description, priority, status, progress, assignedToId, dueDate } = updateData;
    // Sync status and progress
    let finalStatus = status || task.status;
    let finalProgress = progress !== undefined ? progress : task.progress;
    if (status !== undefined && progress === undefined) {
        if (status === client_1.TaskStatus.TODO) {
            finalProgress = 0;
        }
        else if (status === client_1.TaskStatus.DONE) {
            finalProgress = 100;
        }
        else if (status === client_1.TaskStatus.IN_PROGRESS && (task.progress === 0 || task.progress === 100)) {
            finalProgress = 50;
        }
    }
    else if (progress !== undefined && status === undefined) {
        if (progress === 0) {
            finalStatus = client_1.TaskStatus.TODO;
        }
        else if (progress === 100) {
            finalStatus = client_1.TaskStatus.DONE;
        }
        else {
            finalStatus = client_1.TaskStatus.IN_PROGRESS;
        }
    }
    else if (status !== undefined && progress !== undefined) {
        if (progress === 0) {
            finalStatus = client_1.TaskStatus.TODO;
        }
        else if (progress === 100) {
            finalStatus = client_1.TaskStatus.DONE;
        }
        else if (finalStatus === client_1.TaskStatus.TODO || finalStatus === client_1.TaskStatus.DONE) {
            finalStatus = client_1.TaskStatus.IN_PROGRESS;
        }
    }
    // If changing assignee, verify new assignee is a member of the project
    if (assignedToId && assignedToId !== task.assignedToId) {
        const assignee = await prisma_1.prisma.user.findUnique({
            where: { id: assignedToId },
        });
        if (!assignee) {
            throw new Error("Assignee user not found");
        }
        const projectMembers = await prisma_1.prisma.projectMember.findMany({
            where: { projectId: task.projectId },
        });
        const isMember = projectMembers.some((m) => m.userId === assignedToId);
        if (!isMember && assignee.role !== client_1.Role.ADMIN && task.project.managerId !== assignedToId) {
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
    const updatedTask = await prisma_1.prisma.task.update({
        where: { id: taskId },
        data: {
            title: title || undefined,
            description: description !== undefined ? description : undefined,
            priority: priority || undefined,
            status: finalStatus,
            progress: finalProgress,
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
    await (0, extra_service_1.checkAndUpdateProjectCompletion)(updatedTask.projectId);
    await (0, extra_service_1.logActivity)(`updated Task "${updatedTask.title}"`, currentUserId, updatedTask.projectId);
    const actor = await prisma_1.prisma.user.findUnique({ where: { id: currentUserId } });
    const actorText = actor ? `${actor.name} (${actor.role.replace("_", " ").toLowerCase()})` : "System";
    if (assignedToId && assignedToId !== task.assignedToId) {
        if (assignedToId !== currentUserId) {
            await (0, extra_service_1.sendNotification)(`Task "${updatedTask.title}" has been assigned to you by ${actorText}.`, assignedToId);
        }
    }
    return updatedTask;
};
exports.updateTask = updateTask;
const deleteTask = async (taskId, currentUserId, currentUserRole) => {
    const task = await prisma_1.prisma.task.findUnique({
        where: { id: taskId },
        include: {
            project: true,
        },
    });
    if (!task) {
        throw new Error("Task not found");
    }
    // Access Control: Only Admin or the project manager can delete tasks
    if (currentUserRole !== client_1.Role.ADMIN && task.project.managerId !== currentUserId) {
        throw new Error("Access denied. You do not have permission to delete this task.");
    }
    await prisma_1.prisma.task.delete({
        where: { id: taskId },
    });
    await (0, extra_service_1.checkAndUpdateProjectCompletion)(task.projectId);
    const actor = await prisma_1.prisma.user.findUnique({ where: { id: currentUserId } });
    const actorText = actor ? `${actor.name} (${actor.role.replace("_", " ").toLowerCase()})` : "System";
    await (0, extra_service_1.logActivity)(`deleted Task "${task.title}" from Project "${task.project.name}"`, currentUserId, task.projectId);
    if (task.assignedToId && task.assignedToId !== currentUserId) {
        await (0, extra_service_1.sendNotification)(`Task "${task.title}" in Project "${task.project.name}" was deleted by ${actorText}.`, task.assignedToId);
    }
    return { message: "Task deleted successfully" };
};
exports.deleteTask = deleteTask;
const assignTask = async (taskId, assignedToId, currentUserId, currentUserRole) => {
    const task = await prisma_1.prisma.task.findUnique({
        where: { id: taskId },
        include: { project: { include: { members: true } } },
    });
    if (!task) {
        throw new Error("Task not found");
    }
    // Access Control: Only Admin or the project manager can assign task
    if (currentUserRole !== client_1.Role.ADMIN && task.project.managerId !== currentUserId) {
        throw new Error("Access denied. You do not have permission to assign this task.");
    }
    // Verify assignee exists
    const assignee = await prisma_1.prisma.user.findUnique({
        where: { id: assignedToId },
    });
    if (!assignee) {
        throw new Error("Assignee user not found");
    }
    // Check if assignee is a member of the project
    const isMember = task.project.members.some((m) => m.userId === assignedToId);
    if (!isMember && assignee.role !== client_1.Role.ADMIN && task.project.managerId !== assignedToId) {
        throw new Error("User must be a member of the project before tasks can be assigned to them.");
    }
    const updatedTask = await prisma_1.prisma.task.update({
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
    await (0, extra_service_1.logActivity)(`assigned Task "${task.title}" to ${updatedTask.assignedTo?.name}`, currentUserId, task.projectId);
    const actor = await prisma_1.prisma.user.findUnique({ where: { id: currentUserId } });
    const actorText = actor ? `${actor.name} (${actor.role.replace("_", " ").toLowerCase()})` : "System";
    if (assignedToId !== currentUserId) {
        await (0, extra_service_1.sendNotification)(`Task "${task.title}" has been assigned to you by ${actorText}.`, assignedToId);
    }
    return updatedTask;
};
exports.assignTask = assignTask;
const updateTaskStatus = async (taskId, status, currentUserId, currentUserRole) => {
    const task = await prisma_1.prisma.task.findUnique({
        where: { id: taskId },
        include: { project: true },
    });
    if (!task) {
        throw new Error("Task not found");
    }
    // Access Control: Admin (any), PM (if manager), Member (if assignee)
    let isAuthorized = false;
    if (currentUserRole === client_1.Role.ADMIN) {
        isAuthorized = true;
    }
    else if (currentUserRole === client_1.Role.PROJECT_MANAGER && task.project.managerId === currentUserId) {
        isAuthorized = true;
    }
    else if (task.assignedToId === currentUserId) {
        isAuthorized = true;
    }
    if (!isAuthorized) {
        throw new Error("Access denied. You do not have permission to update the status of this task.");
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
        where: { id: taskId },
        data: {
            status,
            progress,
        },
    });
    await (0, extra_service_1.logActivity)(`updated Task "${task.title}" status to ${status}`, currentUserId, task.projectId);
    await (0, extra_service_1.checkAndUpdateProjectCompletion)(task.projectId);
    return updatedTask;
};
exports.updateTaskStatus = updateTaskStatus;
const getMyTasks = async (userId) => {
    return prisma_1.prisma.task.findMany({
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
exports.getMyTasks = getMyTasks;
