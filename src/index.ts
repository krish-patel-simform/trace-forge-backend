import './config/env.js';
import './config/dbConnection.js';
import './config/redis.js'; // Establish Redis connection on startup
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { env } from './config/env.js';
import { initSocket } from './config/socket.js';
import dummyRouter from './routes/dummyRoutes.ts';
import eventRouter from './routes/events.routes.js';
import authRouter from './routes/auth.routes.js';
import projectRouter from './routes/project.routes.js';
import analyticsRouter from './routes/analytics.routes.js';
import realtimeRouter from './routes/realtime.routes.js';
import { startEventWorker } from './workers/event.worker.js';

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
initSocket(httpServer);

const PORT = env.PORT;

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

app.use('/api/dummy', dummyRouter);
app.use('/api/events', eventRouter);
app.use('/api/auth', authRouter);
app.use('/api/projects', projectRouter);
app.use('/api/projects/:projectId/analytics', analyticsRouter);
app.use('/api/projects/:projectId/realtime', realtimeRouter);

// Start the BullMQ event worker in-process
startEventWorker();

httpServer.listen(PORT, () => console.log('🚀 Server is running on port', PORT));
