import { type Request, type Response } from 'express';
import { Types } from 'mongoose';
import { UserService } from '../services/user.service.js';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    const result = await UserService.getUsers(new Types.ObjectId(String(projectId)), { page, limit });
    res.status(200).json(result);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { projectId, userId } = req.params;
    const user = await UserService.getUserProfile(new Types.ObjectId(String(projectId)), String(userId));
    res.status(200).json({ user });
  } catch (error) {
    const err = error as Error;
    const status = err.message === 'User not found' ? 404 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
};

export const getUserSessions = async (req: Request, res: Response) => {
  try {
    const { projectId, userId } = req.params;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    const result = await UserService.getUserSessions(new Types.ObjectId(String(projectId)), String(userId), {
      page,
      limit,
    });
    res.status(200).json(result);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};
