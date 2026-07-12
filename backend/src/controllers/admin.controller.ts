import { Request, Response } from "express";
import * as adminService from "../services/admin.service";
import { createUserSchema, updateUserSchema, changeRoleSchema } from "../validations/admin.validation";

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = createUserSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const result = await adminService.createUser(req.body);
    res.status(201).json({
      success: true,
      user: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await adminService.getAllUsers();
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: "Invalid user ID" });
      return;
    }

    const result = await adminService.getUserById(id);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(404).json({ success: false, error: error.message });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: "Invalid user ID" });
      return;
    }

    const parseResult = updateUserSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const result = await adminService.updateUser(id, req.body);
    res.status(200).json({
      success: true,
      user: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: "Invalid user ID" });
      return;
    }

    const result = await adminService.deleteUser(id);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const changeRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: "Invalid user ID" });
      return;
    }

    const parseResult = changeRoleSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const result = await adminService.changeUserRole(id, req.body.role);
    res.status(200).json({
      success: true,
      user: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await adminService.getSystemStats();
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await adminService.getAllProjects();
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
