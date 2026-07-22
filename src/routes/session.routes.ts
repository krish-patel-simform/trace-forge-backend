import { Router } from 'express';
import { getSessions, getSessionEvents } from '../controllers/session.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router({ mergeParams: true });

router.use(protect);

router.get('/', getSessions);
router.get('/:sessionId', getSessionEvents);

export default router;
