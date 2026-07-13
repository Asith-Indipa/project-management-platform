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
exports.getDashboardStats = exports.getProjectProgress = exports.removeMember = exports.assignMember = exports.deleteProject = exports.updateProject = exports.getProjectById = exports.getProjects = exports.createProject = void 0;
const projectService = __importStar(require("../services/project.service"));
const project_validation_1 = require("../validations/project.validation");
const createProject = async (req, res) => {
    try {
        const parseResult = project_validation_1.createProjectSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({
                success: false,
                errors: parseResult.error.flatten().fieldErrors,
            });
            return;
        }
        const result = await projectService.createProject(req.body);
        res.status(201).json({
            success: true,
            project: result,
        });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.createProject = createProject;
const getProjects = async (req, res) => {
    try {
        const userId = req.user.userId;
        const role = req.user.role;
        const result = await projectService.getAllProjects(userId, role);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.getProjects = getProjects;
const getProjectById = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ success: false, error: "Invalid project ID" });
            return;
        }
        const userId = req.user.userId;
        const role = req.user.role;
        const result = await projectService.getProjectById(id, userId, role);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(404).json({ success: false, error: error.message });
    }
};
exports.getProjectById = getProjectById;
const updateProject = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ success: false, error: "Invalid project ID" });
            return;
        }
        const parseResult = project_validation_1.updateProjectSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({
                success: false,
                errors: parseResult.error.flatten().fieldErrors,
            });
            return;
        }
        const userId = req.user.userId;
        const role = req.user.role;
        const result = await projectService.updateProject(id, userId, role, req.body);
        res.status(200).json({
            success: true,
            project: result,
        });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.updateProject = updateProject;
const deleteProject = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ success: false, error: "Invalid project ID" });
            return;
        }
        const userId = req.user.userId;
        const role = req.user.role;
        const result = await projectService.deleteProject(id, userId, role);
        res.status(200).json({
            success: true,
            ...result,
        });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.deleteProject = deleteProject;
const assignMember = async (req, res) => {
    try {
        const projectId = parseInt(req.params.projectId, 10);
        if (isNaN(projectId)) {
            res.status(400).json({ success: false, error: "Invalid project ID" });
            return;
        }
        const parseResult = project_validation_1.assignMemberSchema.safeParse(req.body);
        if (!parseResult.success) {
            res.status(400).json({
                success: false,
                errors: parseResult.error.flatten().fieldErrors,
            });
            return;
        }
        const currentUserId = req.user.userId;
        const currentUserRole = req.user.role;
        const result = await projectService.assignMember(projectId, req.body.userId, currentUserId, currentUserRole);
        res.status(201).json({
            success: true,
            member: result,
        });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.assignMember = assignMember;
const removeMember = async (req, res) => {
    try {
        const projectId = parseInt(req.params.projectId, 10);
        const userId = parseInt(req.params.userId, 10);
        if (isNaN(projectId) || isNaN(userId)) {
            res.status(400).json({ success: false, error: "Invalid project ID or user ID" });
            return;
        }
        const currentUserId = req.user.userId;
        const currentUserRole = req.user.role;
        const result = await projectService.removeMember(projectId, userId, currentUserId, currentUserRole);
        res.status(200).json({
            success: true,
            ...result,
        });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.removeMember = removeMember;
const getProjectProgress = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ success: false, error: "Invalid project ID" });
            return;
        }
        const userId = req.user.userId;
        const role = req.user.role;
        const result = await projectService.getProjectProgress(id, userId, role);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.getProjectProgress = getProjectProgress;
const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.userId;
        const role = req.user.role;
        const result = await projectService.getDashboardStats(userId, role);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.getDashboardStats = getDashboardStats;
