import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as dashboardService from "../services/dashboard.service";

export const getAdminStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await dashboardService.getAdminStats();
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getManagerStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const result = await dashboardService.getManagerStats(userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getTeamMemberStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const result = await dashboardService.getTeamMemberStats(userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
