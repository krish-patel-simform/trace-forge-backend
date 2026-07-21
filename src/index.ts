import './config/env.js';
import './config/dbConnection.js';
import './config/redis.js'; // Establish Redis connection on startup
import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import dummyRouter from './routes/dummyRoutes.ts';
import eventRouter from './routes/events.routes.js';
import authRouter from './routes/auth.routes.js';
import projectRouter from './routes/project.routes.js';
import { startEventWorker } from './workers/event.worker.js';

const app = express();

const PORT = env.PORT;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api/dummy', dummyRouter);
app.use('/api/events', eventRouter);
app.use('/api/auth', authRouter);
app.use('/api/projects', projectRouter);

// Start the BullMQ event worker in-process
startEventWorker();

app.listen(PORT, () => console.log('🚀 Server is running on port', PORT));
