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
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const projectController = __importStar(require("../controllers/project.controller"));
const taskController = __importStar(require("../controllers/task.controller"));
const router = (0, express_1.Router)();
// All project routes require the user to be logged in
router.use(auth_middleware_1.authMiddleware);
// Middleware for Admin and Project Manager permissions
const managerOrAdmin = (0, role_middleware_1.roleMiddleware)("ADMIN", "PROJECT_MANAGER");
// Project CRUD Operations
router.post("/", managerOrAdmin, projectController.createProject);
router.get("/", projectController.getProjects);
router.get("/dashboard", projectController.getDashboardStats);
router.get("/:id", projectController.getProjectById);
router.get("/:id/progress", projectController.getProjectProgress);
router.put("/:id", managerOrAdmin, projectController.updateProject);
router.delete("/:id", managerOrAdmin, projectController.deleteProject);
// Project Member Management
router.post("/:projectId/members", managerOrAdmin, projectController.assignMember);
router.delete("/:projectId/members/:userId", managerOrAdmin, projectController.removeMember);
// Project Task Management
router.get("/:projectId/tasks", taskController.getProjectTasks);
exports.default = router;
