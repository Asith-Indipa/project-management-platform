"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = exports.loginUser = exports.registerUser = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const generateToken_1 = require("../utils/generateToken");
const registerUser = async (userData) => {
    const { name, email, password, role } = userData;
    const existingUser = await client_1.default.user.findUnique({
        where: { email }
    });
    if (existingUser) {
        throw new Error('User already exists');
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    const newUser = await client_1.default.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role: role || 'TEAM_MEMBER'
        }
    });
    const token = (0, generateToken_1.generateToken)(newUser.id, newUser.role);
    return {
        user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
        },
        token
    };
};
exports.registerUser = registerUser;
const loginUser = async (credentials) => {
    const { email, password } = credentials;
    const user = await client_1.default.user.findUnique({
        where: { email }
    });
    if (!user) {
        throw new Error('Invalid email or password');
    }
    const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid email or password');
    }
    const token = (0, generateToken_1.generateToken)(user.id, user.role);
    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        },
        token
    };
};
exports.loginUser = loginUser;
const getUserById = async (userId) => {
    const user = await client_1.default.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    if (!user) {
        throw new Error("User not found");
    }
    return {
        success: true,
        user,
    };
};
exports.getUserById = getUserById;
