import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as projectService from "../services/project.service";
import { createProjectSchema, updateProjectSchema, assignMemberSchema } from "../validations/project.validation";
import { Role } from "@prisma/client";

export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parseResult = createProjectSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const result = await projectService.createProject(req.body, req.user!.userId);
    res.status(201).json({
      success: true,
      project: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role as Role;

    const result = await projectService.getAllProjects(userId, role);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getProjectById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: "Invalid project ID" });
      return;
    }

    const userId = req.user!.userId;
    const role = req.user!.role as Role;

    const result = await projectService.getProjectById(id, userId, role);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(404).json({ success: false, error: error.message });
  }
};

export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: "Invalid project ID" });
      return;
    }

    const parseResult = updateProjectSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const userId = req.user!.userId;
    const role = req.user!.role as Role;

    const result = await projectService.updateProject(id, userId, role, req.body);
    res.status(200).json({
      success: true,
      project: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: "Invalid project ID" });
      return;
    }

    const userId = req.user!.userId;
    const role = req.user!.role as Role;

    const result = await projectService.deleteProject(id, userId, role);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const assignMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projectId = parseInt(req.params.projectId as string, 10);
    if (isNaN(projectId)) {
      res.status(400).json({ success: false, error: "Invalid project ID" });
      return;
    }

    const parseResult = assignMemberSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const currentUserId = req.user!.userId;
    const currentUserRole = req.user!.role as Role;

    const result = await projectService.assignMember(projectId, req.body.userId, currentUserId, currentUserRole);
    res.status(201).json({
      success: true,
      member: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const removeMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projectId = parseInt(req.params.projectId as string, 10);
    const userId = parseInt(req.params.userId as string, 10);

    if (isNaN(projectId) || isNaN(userId)) {
      res.status(400).json({ success: false, error: "Invalid project ID or user ID" });
      return;
    }

    const currentUserId = req.user!.userId;
    const currentUserRole = req.user!.role as Role;

    const result = await projectService.removeMember(projectId, userId, currentUserId, currentUserRole);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getProjectProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: "Invalid project ID" });
      return;
    }

    const userId = req.user!.userId;
    const role = req.user!.role as Role;

    const result = await projectService.getProjectProgress(id, userId, role);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role as Role;

    const result = await projectService.getDashboardStats(userId, role);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
