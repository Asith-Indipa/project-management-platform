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
exports.getUsers = exports.readNotification = exports.getNotifications = exports.getProjectActivities = exports.getActivities = void 0;
const extraService = __importStar(require("../services/extra.service"));
// ============================================================================
// ACTIVITY TIMELINE
// ============================================================================
const getActivities = async (req, res) => {
    try {
        const userId = req.user.userId;
        const role = req.user.role;
        const result = await extraService.getSystemActivities(userId, role);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.getActivities = getActivities;
const getProjectActivities = async (req, res) => {
    try {
        const projectId = parseInt(req.params.projectId, 10);
        if (isNaN(projectId)) {
            res.status(400).json({ success: false, error: "Invalid project ID" });
            return;
        }
        const result = await extraService.getProjectActivities(projectId);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.getProjectActivities = getProjectActivities;
// ============================================================================
// NOTIFICATIONS
// ============================================================================
const getNotifications = async (req, res) => {
    try {
        const userId = req.user.userId;
        const role = req.user.role;
        const result = await extraService.getMyNotifications(userId, role);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.getNotifications = getNotifications;
const readNotification = async (req, res) => {
    try {
        const userId = req.user.userId;
        const role = req.user.role;
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ success: false, error: "Invalid notification ID" });
            return;
        }
        const result = await extraService.markAsRead(id, userId, role);
        res.status(200).json({ success: true, notification: result });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
exports.readNotification = readNotification;
const getUsers = async (req, res) => {
    try {
        const result = await extraService.getUsers();
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.getUsers = getUsers;
