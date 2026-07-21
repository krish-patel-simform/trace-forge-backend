import { Router } from 'express';
import { getUsers, getUserProfile, getUserSessions } from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router({ mergeParams: true });

router.use(protect);

router.get('/', getUsers);
router.get('/:userId', getUserProfile);
router.get('/:userId/sessions', getUserSessions);

export default router;
