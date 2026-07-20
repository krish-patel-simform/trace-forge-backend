import express from 'express';
import { checkEventController } from '../controllers/events.controller.ts';

const eventRouter = express.Router();

eventRouter.route('/check').post(checkEventController);

export default eventRouter;
