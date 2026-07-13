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
exports.getMyTasks = exports.updateTaskStatus = exports.assignTask = exports.deleteTask = exports.updateTask = exports.getProjectTasks = exports.createTask = void 0;
const taskService = __importStar(require("../services/task.service"));
const task_validation_1 = require("../validations/task.validation");
const createTask = async (req, res) => {
    try {
        const parseResult = task_validation_1.createTaskSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({
                success: false,
                errors: parseResult.error.flatten().fieldErrors,
            });
            return;
        }
        const currentUserId = req.user.userId;
        const currentUserRole = req.user.role;
        const result = await taskService.createTask(req.body, currentUserId, currentUserRole);
        res.status(201).json({
            success: true,
            task: result,
        });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.createTask = createTask;
const getProjectTasks = async (req, res) => {
    try {
        const projectId = parseInt(req.params.projectId, 10);
        if (isNaN(projectId)) {
            res.status(400).json({ success: false, error: "Invalid project ID" });
            return;
        }
        const currentUserId = req.user.userId;
        const currentUserRole = req.user.role;
        const result = await taskService.getProjectTasks(projectId, currentUserId, currentUserRole);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.getProjectTasks = getProjectTasks;
const updateTask = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ success: false, error: "Invalid task ID" });
            return;
        }
        const parseResult = task_validation_1.updateTaskSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({
                success: false,
                errors: parseResult.error.flatten().fieldErrors,
            });
            return;
        }
        const currentUserId = req.user.userId;
        const currentUserRole = req.user.role;
        const result = await taskService.updateTask(id, req.body, currentUserId, currentUserRole);
        res.status(200).json({
            success: true,
            task: result,
        });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.updateTask = updateTask;
const deleteTask = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ success: false, error: "Invalid task ID" });
            return;
        }
        const currentUserId = req.user.userId;
        const currentUserRole = req.user.role;
        const result = await taskService.deleteTask(id, currentUserId, currentUserRole);
        res.status(200).json({
            success: true,
            ...result,
        });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.deleteTask = deleteTask;
const assignTask = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ success: false, error: "Invalid task ID" });
            return;
        }
        const parseResult = task_validation_1.assignTaskSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({
                success: false,
                errors: parseResult.error.flatten().fieldErrors,
            });
            return;
        }
        const currentUserId = req.user.userId;
        const currentUserRole = req.user.role;
        const { assignedToId } = req.body;
        const result = await taskService.assignTask(id, assignedToId, currentUserId, currentUserRole);
        res.status(200).json({
            success: true,
            task: result,
        });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.assignTask = assignTask;
const updateTaskStatus = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ success: false, error: "Invalid task ID" });
            return;
        }
        const parseResult = task_validation_1.updateStatusSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({
                success: false,
                errors: parseResult.error.flatten().fieldErrors,
            });
            return;
        }
        const currentUserId = req.user.userId;
        const currentUserRole = req.user.role;
        const { status } = req.body;
        const result = await taskService.updateTaskStatus(id, status, currentUserId, currentUserRole);
        res.status(200).json({
            success: true,
            task: result,
        });
    }
    catch (error) {
        res.status(403).json({ success: false, error: error.message });
    }
};
exports.updateTaskStatus = updateTaskStatus;
const getMyTasks = async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await taskService.getMyTasks(userId);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.getMyTasks = getMyTasks;
