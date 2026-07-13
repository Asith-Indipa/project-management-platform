"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProjects = exports.getSystemStats = exports.changeUserRole = exports.deleteUser = exports.updateUser = exports.getUserById = exports.getAllUsers = exports.createUser = void 0;
const prisma_1 = require("../config/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const createUser = async (userData) => {
    const { name, email, password, role } = userData;
    const existingUser = await prisma_1.prisma.user.findUnique({
        where: { email },
    });
    if (existingUser) {
        throw new Error("User already exists");
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    const newUser = await prisma_1.prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
        },
    });
    return newUser;
};
exports.createUser = createUser;
const getAllUsers = async () => {
    return prisma_1.prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
        },
    });
};
exports.getAllUsers = getAllUsers;
const getUserById = async (id) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
        },
    });
    if (!user) {
        throw new Error("User not found");
    }
    return user;
};
exports.getUserById = getUserById;
const updateUser = async (id, updateData) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id },
    });
    if (!user) {
        throw new Error("User not found");
    }
    return prisma_1.prisma.user.update({
        where: { id },
        data: updateData,
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            updatedAt: true,
        },
    });
};
exports.updateUser = updateUser;
const deleteUser = async (id, requesterId) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id },
    });
    if (!user) {
        throw new Error("User not found");
    }
    // 1. Prevent self-deletion
    if (user.id === requesterId) {
        throw new Error("Self-deletion is not permitted. You cannot delete your own account.");
    }
    // 2. Prevent deleting other Admins
    if (user.role === client_1.Role.ADMIN) {
        throw new Error("Access denied. Admin accounts cannot be deleted.");
    }
    await prisma_1.prisma.user.delete({
        where: { id },
    });
    return { message: "User deleted successfully" };
};
exports.deleteUser = deleteUser;
const changeUserRole = async (id, role) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id },
    });
    if (!user) {
        throw new Error("User not found");
    }
    return prisma_1.prisma.user.update({
        where: { id },
        data: { role },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            updatedAt: true,
        },
    });
};
exports.changeUserRole = changeUserRole;
const getSystemStats = async () => {
    const totalUsers = await prisma_1.prisma.user.count();
    const totalProjects = await prisma_1.prisma.project.count();
    const totalTasks = await prisma_1.prisma.task.count();
    const completedTasks = await prisma_1.prisma.task.count({
        where: { status: "DONE" },
    });
    const pendingTasks = await prisma_1.prisma.task.count({
        where: { status: { in: ["TODO", "IN_PROGRESS"] } },
    });
    return {
        totalUsers,
        totalProjects,
        totalTasks,
        completedTasks,
        pendingTasks,
    };
};
exports.getSystemStats = getSystemStats;
const getAllProjects = async () => {
    return prisma_1.prisma.project.findMany({
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
                select: {
                    id: true,
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
                select: {
                    id: true,
                    title: true,
                    status: true,
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
exports.getAllProjects = getAllProjects;
