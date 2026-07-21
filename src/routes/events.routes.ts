import express from 'express';
import { ingestEventController } from '../controllers/events.controller.js';
import { sdkAuth } from '../middlewares/sdk-auth.middleware.js';

const eventRouter = express.Router();

/**
 * POST /api/events
 * Authenticated via the x-api-key header (sdkAuth middleware).
 * Accepts a single SDK event and queues it for async persistence.
 */
eventRouter.post('/', sdkAuth, ingestEventController);

export default eventRouter;
