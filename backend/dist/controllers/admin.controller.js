"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjects = exports.getStats = exports.changeRole = exports.deleteUser = exports.updateUser = exports.getUserById = exports.getAllUsers = exports.createUser = void 0;
const adminService = __importStar(require("../services/admin.service"));
const admin_validation_1 = require("../validations/admin.validation");
const createUser = async (req, res) => {
    try {
        const parseResult = admin_validation_1.createUserSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({
                success: false,
                errors: parseResult.error.flatten().fieldErrors,
            });
            return;
        }
        const result = await adminService.createUser(req.body);
        res.status(201).json({
            success: true,
            user: result,
        });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.createUser = createUser;
const getAllUsers = async (req, res) => {
    try {
        const result = await adminService.getAllUsers();
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.getAllUsers = getAllUsers;
const getUserById = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ success: false, error: "Invalid user ID" });
            return;
        }
        const result = await adminService.getUserById(id);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(404).json({ success: false, error: error.message });
    }
};
exports.getUserById = getUserById;
const updateUser = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ success: false, error: "Invalid user ID" });
            return;
        }
        const parseResult = admin_validation_1.updateUserSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({
                success: false,
                errors: parseResult.error.flatten().fieldErrors,
            });
            return;
        }
        const result = await adminService.updateUser(id, req.body);
        res.status(200).json({
            success: true,
            user: result,
        });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ success: false, error: "Invalid user ID" });
            return;
        }
        const requesterId = req.user?.userId;
        if (!requesterId) {
            res.status(401).json({ success: false, error: "Unauthorized" });
            return;
        }
        const result = await adminService.deleteUser(id, requesterId);
        res.status(200).json({
            success: true,
            ...result,
        });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.deleteUser = deleteUser;
const changeRole = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ success: false, error: "Invalid user ID" });
            return;
        }
        const parseResult = admin_validation_1.changeRoleSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({
                success: false,
                errors: parseResult.error.flatten().fieldErrors,
            });
            return;
        }
        const result = await adminService.changeUserRole(id, req.body.role);
        res.status(200).json({
            success: true,
            user: result,
        });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.changeRole = changeRole;
const getStats = async (req, res) => {
    try {
        const result = await adminService.getSystemStats();
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.getStats = getStats;
const getProjects = async (req, res) => {
    try {
        const result = await adminService.getAllProjects();
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.getProjects = getProjects;
