import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import * as extraController from "../controllers/extra.controller";

const router = Router();

// Authentication required for all endpoints
router.use(authMiddleware);

// Activities Route
router.get("/activities", extraController.getActivities);
router.get("/projects/:projectId/activities", extraController.getProjectActivities);

// Notifications Route
router.get("/notifications", extraController.getNotifications);
router.patch("/notifications/:id/read", extraController.readNotification);

export default router;
