import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { roleMiddleware } from "../middleware/role.middleware";
import * as projectController from "../controllers/project.controller";
import * as taskController from "../controllers/task.controller";

const router = Router();

// All project routes require the user to be logged in
router.use(authMiddleware);

// Middleware for Admin and Project Manager permissions
const managerOrAdmin = roleMiddleware("ADMIN", "PROJECT_MANAGER");

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

export default router;
