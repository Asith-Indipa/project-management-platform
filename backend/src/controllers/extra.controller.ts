import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as extraService from "../services/extra.service";

// ============================================================================
// ACTIVITY TIMELINE
// ============================================================================

export const getActivities = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await extraService.getSystemActivities();
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getProjectActivities = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projectId = parseInt(req.params.projectId as string, 10);
    if (isNaN(projectId)) {
      res.status(400).json({ success: false, error: "Invalid project ID" });
      return;
    }
    const result = await extraService.getProjectActivities(projectId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const result = await extraService.getMyNotifications(userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const readNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: "Invalid notification ID" });
      return;
    }
    const result = await extraService.markAsRead(id, userId);
    res.status(200).json({ success: true, notification: result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
