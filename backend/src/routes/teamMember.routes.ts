import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import * as teamMemberController from "../controllers/teamMember.controller";

const router = Router();

router.use(authMiddleware);

router.get("/projects", teamMemberController.getMyProjects);
router.get("/tasks", teamMemberController.getMyTasks);
router.get("/tasks/:id", teamMemberController.getSingleTask);
router.patch("/tasks/:id/progress", teamMemberController.updateTaskProgress);
router.patch("/tasks/:id/status", teamMemberController.updateTaskStatus);

export default router;
