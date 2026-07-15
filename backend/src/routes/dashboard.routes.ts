import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { roleMiddleware } from "../middleware/role.middleware";
import * as dashboardController from "../controllers/dashboard.controller";

const router = Router();

// All dashboard endpoints require authentication
router.use(authMiddleware);

// Role-Based Access Control (RBAC) protected stats endpoints
router.get("/admin", roleMiddleware("ADMIN"), dashboardController.getAdminStats);
router.get("/project-manager", roleMiddleware("PROJECT_MANAGER"), dashboardController.getManagerStats);
router.get("/team-member", roleMiddleware("TEAM_MEMBER"), dashboardController.getTeamMemberStats);

export default router;