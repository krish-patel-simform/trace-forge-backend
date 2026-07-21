import './config/env.js';
import './config/dbConnection.js';
import express from 'express';
import { env } from './config/env.js';
import dummyRouter from './routes/dummyRoutes.ts';
import eventRouter from './routes/events.routes.ts';

import authRouter from './routes/auth.routes.js';
import projectRouter from './routes/project.routes.js';

const app = express();

const PORT = env.PORT;

app.use(express.json());

app.use('/api/dummy', dummyRouter);
app.use('/api/event', eventRouter);
app.use('/api/auth', authRouter);
app.use('/api/projects', projectRouter);

app.listen(PORT, () => console.log('🚀 Server is running on port', PORT));
