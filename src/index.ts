import './config/env.js';
import './config/dbConnection.js';
import './config/redis.js'; // Establish Redis connection on startup
import express from 'express';
import cors from 'cors';
import type { CorsOptions } from 'cors';
import { createServer } from 'http';
import { env } from './config/env.js';
import { initSocket } from './config/socket.js';
import dummyRouter from './routes/dummyRoutes.js';
import eventRouter from './routes/events.routes.js';
import authRouter from './routes/auth.routes.js';
import projectRouter from './routes/project.routes.js';
import analyticsRouter from './routes/analytics.routes.js';
import realtimeRouter from './routes/realtime.routes.js';
import sessionRouter from './routes/session.routes.js';
import userRouter from './routes/user.routes.js';
import { startEventWorker } from './workers/event.worker.js';

const app = express();

// ---------------------------------------------------------------------------
// CORS — must be registered before any routes or body parsers.
//
// We use a single shared `corsOptions` object for BOTH the preflight handler
// and the per-request middleware. This is critical: if the two calls use
// different configs, browsers reject the real request because the allowed
// headers advertised in the OPTIONS response don't match the actual response.
//
// `origin: "*"` is intentional — this is a public SDK endpoint that must
// accept requests from any website. We do NOT use cookies or credentials, so
// the wildcard origin is both safe and required for SDK use cases.
// ---------------------------------------------------------------------------
const corsOptions: CorsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
};

// Handle browser preflight (OPTIONS) requests for ALL routes.
// Note: Express 5 (path-to-regexp v8+) no longer accepts a bare '*' wildcard
// in route strings — use a regex instead.
app.options(/.*/, cors(corsOptions));

// Apply CORS headers to all actual requests
app.use(cors(corsOptions));

// Parse JSON bodies before all routes
app.use(express.json());

const httpServer = createServer(app);
const PORT = env.PORT;

// Initialize Socket.io
initSocket(httpServer);

app.use('/api/dummy', dummyRouter);
app.use('/api/events', eventRouter);
app.use('/api/auth', authRouter);
app.use('/api/projects', projectRouter);
app.use('/api/projects/:projectId/analytics', analyticsRouter);
app.use('/api/projects/:projectId/realtime', realtimeRouter);
app.use('/api/projects/:projectId/sessions', sessionRouter);
app.use('/api/projects/:projectId/users', userRouter);

// Start the BullMQ event worker in-process
startEventWorker();

httpServer.listen(PORT, () => console.log('🚀 Server is running on port', PORT));
