import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { roleMiddleware } from "../middleware/role.middleware";
import * as taskController from "../controllers/task.controller";

const router = Router();

// All task routes require the user to be logged in
router.use(authMiddleware);

// Middleware for Admin and Project Manager permissions
const managerOrAdmin = roleMiddleware("ADMIN", "PROJECT_MANAGER");

// Task CRUD Operations
router.post("/", managerOrAdmin, taskController.createTask);
router.put("/:id", managerOrAdmin, taskController.updateTask);
router.delete("/:id", managerOrAdmin, taskController.deleteTask);

// Task Assignment and Status Updates
router.patch("/:id/assign", managerOrAdmin, taskController.assignTask);
router.patch("/:id/status", taskController.updateTaskStatus);

export default router;
