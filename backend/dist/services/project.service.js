"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = exports.getProjectProgress = exports.removeMember = exports.assignMember = exports.deleteProject = exports.updateProject = exports.getProjectById = exports.getAllProjects = exports.createProject = void 0;
const prisma_1 = require("../config/prisma");
const client_1 = require("@prisma/client");
const extra_service_1 = require("./extra.service");
const createProject = async (projectData, creatorId) => {
    const { name, description, managerId, startDate, endDate, status } = projectData;
    // Verify that the manager exists and is either an ADMIN or a PROJECT_MANAGER
    const manager = await prisma_1.prisma.user.findUnique({
        where: { id: managerId },
    });
    if (!manager) {
        throw new Error("Manager user not found");
    }
    if (manager.role !== client_1.Role.ADMIN && manager.role !== client_1.Role.PROJECT_MANAGER) {
        throw new Error("Manager user must have ADMIN or PROJECT_MANAGER role");
    }
    const project = await prisma_1.prisma.project.create({
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
    const actor = await prisma_1.prisma.user.findUnique({ where: { id: creatorId } });
    const actorText = actor ? `${actor.name} (${actor.role.replace("_", " ").toLowerCase()})` : "System";
    await (0, extra_service_1.logActivity)(`created Project "${name}"`, creatorId, project.id);
    if (managerId !== creatorId) {
        await (0, extra_service_1.sendNotification)(`You have been assigned as the manager for Project "${name}" by ${actorText}`, managerId);
    }
    return project;
};
exports.createProject = createProject;
const getAllProjects = async (userId, userRole) => {
    let whereClause = {};
    // Admin gets all projects. PM gets only projects they manage.
    // Team Member gets projects they are members of.
    if (userRole === client_1.Role.PROJECT_MANAGER) {
        whereClause = { managerId: userId };
    }
    else if (userRole === client_1.Role.TEAM_MEMBER) {
        whereClause = {
            members: {
                some: {
                    userId: userId,
                },
            },
        };
    }
    const projects = await prisma_1.prisma.project.findMany({
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
    return projects.map((project) => {
        const totalTasks = project.tasks.length;
        const totalProgress = project.tasks.reduce((sum, t) => sum + (t.progress || 0), 0);
        const completionPercentage = totalTasks > 0 ? Math.round(totalProgress / totalTasks) : 0;
        return {
            ...project,
            completionPercentage,
        };
    });
};
exports.getAllProjects = getAllProjects;
const getProjectById = async (id, userId, userRole) => {
    await (0, extra_service_1.checkAndUpdateProjectCompletion)(id);
    const project = await prisma_1.prisma.project.findUnique({
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
    if (userRole === client_1.Role.PROJECT_MANAGER && project.managerId !== userId) {
        throw new Error("Access denied. You do not manage this project.");
    }
    if (userRole === client_1.Role.TEAM_MEMBER) {
        const isMember = project.members.some((m) => m.userId === userId);
        if (!isMember) {
            throw new Error("Access denied. You are not a member of this project.");
        }
    }
    return {
        ...project,
        completionPercentage: project.tasks.length > 0 ? Math.round(project.tasks.reduce((sum, t) => sum + (t.progress || 0), 0) / project.tasks.length) : 0,
    };
};
exports.getProjectById = getProjectById;
const updateProject = async (id, userId, userRole, updateData) => {
    const project = await prisma_1.prisma.project.findUnique({
        where: { id },
    });
    if (!project) {
        throw new Error("Project not found");
    }
    // Access Control: Only Admin or the Project Manager responsible for this project can update it
    if (userRole !== client_1.Role.ADMIN && project.managerId !== userId) {
        throw new Error("Access denied. You do not have permission to update this project.");
    }
    const { name, description, managerId, startDate, endDate, status } = updateData;
    // If changing manager, verify the new manager
    if (managerId && managerId !== project.managerId) {
        const newManager = await prisma_1.prisma.user.findUnique({
            where: { id: managerId },
        });
        if (!newManager) {
            throw new Error("New manager user not found");
        }
        if (newManager.role !== client_1.Role.ADMIN && newManager.role !== client_1.Role.PROJECT_MANAGER) {
            throw new Error("New manager must have ADMIN or PROJECT_MANAGER role");
        }
    }
    if (status === "COMPLETED") {
        const incompleteTasksCount = await prisma_1.prisma.task.count({
            where: {
                projectId: id,
                OR: [
                    { status: { not: "DONE" } },
                    { progress: { lt: 100 } }
                ]
            }
        });
        if (incompleteTasksCount > 0) {
            throw new Error("Cannot set project status to COMPLETED because some tasks are not 100% complete.");
        }
    }
    const updatedProject = await prisma_1.prisma.project.update({
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
    await (0, extra_service_1.logActivity)(`updated Project "${updatedProject.name}"`, userId, id);
    if (status === "COMPLETED") {
        // Notify all project members and the manager
        const members = await prisma_1.prisma.projectMember.findMany({ where: { projectId: id } });
        await (0, extra_service_1.sendNotification)(`Project "${updatedProject.name}" has been completed!`, updatedProject.managerId);
        for (const m of members) {
            await (0, extra_service_1.sendNotification)(`Project "${updatedProject.name}" has been completed!`, m.userId);
        }
    }
    return updatedProject;
};
exports.updateProject = updateProject;
const deleteProject = async (id, userId, userRole) => {
    const project = await prisma_1.prisma.project.findUnique({
        where: { id },
    });
    if (!project) {
        throw new Error("Project not found");
    }
    // Access Control: Only Admin or the Project Manager responsible for this project can delete it
    if (userRole !== client_1.Role.ADMIN && project.managerId !== userId) {
        throw new Error("Access denied. You do not have permission to delete this project.");
    }
    // Delete all tasks, project member relations, activities, and the project within a transaction to maintain integrity
    await prisma_1.prisma.$transaction([
        prisma_1.prisma.task.deleteMany({
            where: { projectId: id },
        }),
        prisma_1.prisma.projectMember.deleteMany({
            where: { projectId: id },
        }),
        prisma_1.prisma.activity.deleteMany({
            where: { projectId: id },
        }),
        prisma_1.prisma.project.delete({
            where: { id },
        }),
    ]);
    return { message: "Project deleted successfully" };
};
exports.deleteProject = deleteProject;
const assignMember = async (projectId, userId, currentUserId, currentUserRole) => {
    const project = await prisma_1.prisma.project.findUnique({
        where: { id: projectId },
    });
    if (!project) {
        throw new Error("Project not found");
    }
    // Access Control: Only Admin or the project manager can assign members
    if (currentUserRole !== client_1.Role.ADMIN && project.managerId !== currentUserId) {
        throw new Error("Access denied. You do not have permission to assign members to this project.");
    }
    // Verify user exists
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new Error("User to assign not found");
    }
    // Check if already assigned
    const existingMember = await prisma_1.prisma.projectMember.findUnique({
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
    const member = await prisma_1.prisma.projectMember.create({
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
    const actor = await prisma_1.prisma.user.findUnique({ where: { id: currentUserId } });
    const actorText = actor ? `${actor.name} (${actor.role.replace("_", " ").toLowerCase()})` : "System";
    await (0, extra_service_1.logActivity)(`assigned user ${member.user.name} to Project "${project.name}"`, currentUserId, projectId);
    await (0, extra_service_1.sendNotification)(`You have been assigned to Project "${project.name}" by ${actorText}`, userId);
    return member;
};
exports.assignMember = assignMember;
const removeMember = async (projectId, userId, currentUserId, currentUserRole) => {
    const project = await prisma_1.prisma.project.findUnique({
        where: { id: projectId },
    });
    if (!project) {
        throw new Error("Project not found");
    }
    // Access Control: Only Admin or the project manager can remove members
    if (currentUserRole !== client_1.Role.ADMIN && project.managerId !== currentUserId) {
        throw new Error("Access denied. You do not have permission to remove members from this project.");
    }
    // Verify member record exists
    const existingMember = await prisma_1.prisma.projectMember.findUnique({
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
    await prisma_1.prisma.projectMember.delete({
        where: {
            projectId_userId: {
                projectId,
                userId,
            },
        },
    });
    // Get user details for logging
    const targetUser = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
    const targetName = targetUser?.name || `User #${userId}`;
    const actor = await prisma_1.prisma.user.findUnique({ where: { id: currentUserId } });
    const actorText = actor ? `${actor.name} (${actor.role.replace("_", " ").toLowerCase()})` : "System";
    await (0, extra_service_1.logActivity)(`removed user ${targetName} from Project "${project.name}"`, currentUserId, projectId);
    await (0, extra_service_1.sendNotification)(`You have been removed from Project "${project.name}" by ${actorText}`, userId);
    return { message: "Member removed from project successfully" };
};
exports.removeMember = removeMember;
const getProjectProgress = async (projectId, userId, userRole) => {
    const project = await prisma_1.prisma.project.findUnique({
        where: { id: projectId },
        include: { members: true },
    });
    if (!project) {
        throw new Error("Project not found");
    }
    // Access Control
    if (userRole === client_1.Role.PROJECT_MANAGER && project.managerId !== userId) {
        throw new Error("Access denied. You do not manage this project.");
    }
    if (userRole === client_1.Role.TEAM_MEMBER) {
        const isMember = project.members.some((m) => m.userId === userId);
        if (!isMember) {
            throw new Error("Access denied. You are not a member of this project.");
        }
    }
    const tasks = await prisma_1.prisma.task.findMany({ where: { projectId } });
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "DONE").length;
    const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS").length;
    const todoTasks = tasks.filter((t) => t.status === "TODO").length;
    const totalProgress = tasks.reduce((sum, t) => sum + (t.progress || 0), 0);
    const completionPercentage = totalTasks > 0 ? Math.round(totalProgress / totalTasks) : 0;
    return {
        projectId,
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        completionPercentage,
    };
};
exports.getProjectProgress = getProjectProgress;
const getDashboardStats = async (userId, userRole) => {
    let whereClause = {};
    if (userRole === client_1.Role.PROJECT_MANAGER) {
        whereClause = { managerId: userId };
    }
    else if (userRole === client_1.Role.TEAM_MEMBER) {
        whereClause = {
            members: {
                some: {
                    userId,
                },
            },
        };
    }
    const totalProjects = await prisma_1.prisma.project.count({ where: whereClause });
    const activeProjects = await prisma_1.prisma.project.count({ where: { ...whereClause, status: "ACTIVE" } });
    const completedProjects = await prisma_1.prisma.project.count({ where: { ...whereClause, status: "COMPLETED" } });
    const onHoldProjects = await prisma_1.prisma.project.count({ where: { ...whereClause, status: "ON_HOLD" } });
    return {
        totalProjects,
        activeProjects,
        completedProjects,
        onHoldProjects,
    };
};
exports.getDashboardStats = getDashboardStats;
