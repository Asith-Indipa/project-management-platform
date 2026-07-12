import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as teamMemberService from "../services/teamMember.service";
import { updateProgressSchema, updateStatusSchema } from "../validations/teamMember.validation";
import { TaskStatus } from "@prisma/client";

export const getMyProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const result = await teamMemberService.getMyProjects(userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getMyTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const result = await teamMemberService.getMyTasks(userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getSingleTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: "Invalid task ID" });
      return;
    }

    const userId = req.user!.userId;
    const result = await teamMemberService.getSingleTask(id, userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(403).json({ success: false, error: error.message });
  }
};

export const updateTaskProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: "Invalid task ID" });
      return;
    }

    const parseResult = updateProgressSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const userId = req.user!.userId;
    const { progress } = req.body;

    const result = await teamMemberService.updateTaskProgress(id, userId, progress);
    res.status(200).json({
      success: true,
      task: result,
    });
  } catch (error: any) {
    res.status(403).json({ success: false, error: error.message });
  }
};

export const updateTaskStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: "Invalid task ID" });
      return;
    }

    const parseResult = updateStatusSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const userId = req.user!.userId;
    const { status } = req.body;

    const result = await teamMemberService.updateTaskStatus(id, userId, status as TaskStatus);
    res.status(200).json({
      success: true,
      task: result,
    });
  } catch (error: any) {
    res.status(403).json({ success: false, error: error.message });
  }
};
