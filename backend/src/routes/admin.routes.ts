import { Router } from "express";
import * as adminController from "../controllers/admin.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { roleMiddleware } from "../middleware/role.middleware";

const router = Router();

// Protect all routes in this file to ADMIN only
router.use(authMiddleware, roleMiddleware("ADMIN"));

// User Management Routes
router.post("/users", adminController.createUser);
router.get("/users", adminController.getAllUsers);
router.get("/users/:id", adminController.getUserById);
router.put("/users/:id", adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);
router.patch("/users/:id/role", adminController.changeRole);

// Project Monitoring Route
router.get("/projects", adminController.getProjects);

// System Statistics Route
router.get("/stats", adminController.getStats);

export default router;
