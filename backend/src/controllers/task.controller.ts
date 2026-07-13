import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as taskService from "../services/task.service";
import { createTaskSchema, updateTaskSchema, assignTaskSchema, updateStatusSchema } from "../validations/task.validation";
import { Role } from "@prisma/client";

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parseResult = createTaskSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const currentUserId = req.user!.userId;
    const currentUserRole = req.user!.role as Role;

    const result = await taskService.createTask(req.body, currentUserId, currentUserRole);
    res.status(201).json({
      success: true,
      task: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getProjectTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projectId = parseInt(req.params.projectId as string, 10);
    if (isNaN(projectId)) {
      res.status(400).json({ success: false, error: "Invalid project ID" });
      return;
    }

    const currentUserId = req.user!.userId;
    const currentUserRole = req.user!.role as Role;

    const result = await taskService.getProjectTasks(projectId, currentUserId, currentUserRole);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: "Invalid task ID" });
      return;
    }

    const parseResult = updateTaskSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const currentUserId = req.user!.userId;
    const currentUserRole = req.user!.role as Role;

    const result = await taskService.updateTask(id, req.body, currentUserId, currentUserRole);
    res.status(200).json({
      success: true,
      task: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: "Invalid task ID" });
      return;
    }

    const currentUserId = req.user!.userId;
    const currentUserRole = req.user!.role as Role;

    const result = await taskService.deleteTask(id, currentUserId, currentUserRole);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const assignTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: "Invalid task ID" });
      return;
    }

    const parseResult = assignTaskSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const currentUserId = req.user!.userId;
    const currentUserRole = req.user!.role as Role;
    const { assignedToId } = req.body;

    const result = await taskService.assignTask(id, assignedToId, currentUserId, currentUserRole);
    res.status(200).json({
      success: true,
      task: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
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

    const currentUserId = req.user!.userId;
    const currentUserRole = req.user!.role as Role;
    const { status } = req.body;

    const result = await taskService.updateTaskStatus(id, status, currentUserId, currentUserRole);
    res.status(200).json({
      success: true,
      task: result,
    });
  } catch (error: any) {
    res.status(403).json({ success: false, error: error.message });
  }
};

export const getMyTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const result = await taskService.getMyTasks(userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
