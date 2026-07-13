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
exports.updateTaskStatus = exports.updateTaskProgress = exports.getSingleTask = exports.getMyTasks = exports.getMyProjects = void 0;
const teamMemberService = __importStar(require("../services/teamMember.service"));
const teamMember_validation_1 = require("../validations/teamMember.validation");
const getMyProjects = async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await teamMemberService.getMyProjects(userId);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.getMyProjects = getMyProjects;
const getMyTasks = async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await teamMemberService.getMyTasks(userId);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.getMyTasks = getMyTasks;
const getSingleTask = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ success: false, error: "Invalid task ID" });
            return;
        }
        const userId = req.user.userId;
        const result = await teamMemberService.getSingleTask(id, userId);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(403).json({ success: false, error: error.message });
    }
};
exports.getSingleTask = getSingleTask;
const updateTaskProgress = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ success: false, error: "Invalid task ID" });
            return;
        }
        const parseResult = teamMember_validation_1.updateProgressSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({
                success: false,
                errors: parseResult.error.flatten().fieldErrors,
            });
            return;
        }
        const userId = req.user.userId;
        const { progress } = req.body;
        const result = await teamMemberService.updateTaskProgress(id, userId, progress);
        res.status(200).json({
            success: true,
            task: result,
        });
    }
    catch (error) {
        res.status(403).json({ success: false, error: error.message });
    }
};
exports.updateTaskProgress = updateTaskProgress;
const updateTaskStatus = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ success: false, error: "Invalid task ID" });
            return;
        }
        const parseResult = teamMember_validation_1.updateStatusSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({
                success: false,
                errors: parseResult.error.flatten().fieldErrors,
            });
            return;
        }
        const userId = req.user.userId;
        const { status } = req.body;
        const result = await teamMemberService.updateTaskStatus(id, userId, status);
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
