import { Router, type Request, type Response } from 'express';
import { ActiveUsersService } from '../realtime/active-users.js';
import { protect } from '../middlewares/auth.middleware.js';
import { Project } from '../models/project.model.js';

const router = Router({ mergeParams: true });

router.get(
  '/active-users',
  protect,
  async (req: Request<{ projectId: string }>, res: Response): Promise<void> => {
    try {
      const { projectId } = req.params;

      // Verify ownership
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userId = (req as any).user?._id;
      const project = await Project.findOne({ _id: projectId, owner: userId });

      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      const count = await ActiveUsersService.getActiveUserCount(projectId);
      res.json({ count, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error fetching active users:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

export default router;
