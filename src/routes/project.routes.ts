import { Router } from 'express';
import * as projectController from '../controllers/project.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

// Protect all project routes
router.use(protect);

router.post('/', projectController.createProject);
router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProject);
router.patch('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);
router.post('/:id/regenerate-key', projectController.regenerateKey);

export default router;
