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
exports.getTeamMemberStats = exports.getManagerStats = exports.getAdminStats = void 0;
const dashboardService = __importStar(require("../services/dashboard.service"));
const getAdminStats = async (req, res) => {
    try {
        const result = await dashboardService.getAdminStats();
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.getAdminStats = getAdminStats;
const getManagerStats = async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await dashboardService.getManagerStats(userId);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.getManagerStats = getManagerStats;
const getTeamMemberStats = async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await dashboardService.getTeamMemberStats(userId);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.getTeamMemberStats = getTeamMemberStats;
