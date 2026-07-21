import express from 'express';
import { dummyController } from '../controllers/dummy.controller.js';

const dummyRouter = express.Router();

dummyRouter.route('/server-status').get(dummyController);

export default dummyRouter;
