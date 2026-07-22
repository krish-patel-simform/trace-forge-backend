import { type Request, type Response } from 'express';
import { Types } from 'mongoose';
import { SessionService } from '../services/session.service.js';

export const getSessions = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    const result = await SessionService.getSessions(new Types.ObjectId(String(projectId)), { page, limit });
    res.status(200).json(result);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSessionEvents = async (req: Request, res: Response) => {
  try {
    const { projectId, sessionId } = req.params;
    const events = await SessionService.getSessionEvents(new Types.ObjectId(String(projectId)), String(sessionId));
    res.status(200).json({ events });
  } catch (error) {
    const err = error as Error;
    const status = err.message === 'Session not found' ? 404 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
};
