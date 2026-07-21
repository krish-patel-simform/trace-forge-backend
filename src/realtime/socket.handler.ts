import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/token.util.js';
import { Project } from '../models/project.model.js';
import { ActiveUsersService } from './active-users.js';
import { redisConnection } from '../config/redis.js';

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Allow a client to join a project room after authentication
    socket.on('join:project', async (payload: { projectId: string; token: string }) => {
      try {
        const { projectId, token } = payload;

        if (!projectId || !token) {
          console.error(`❌ Client ${socket.id} failed to join: Missing projectId or token`);
          socket.emit('error', { message: 'Missing projectId or token' });
          return;
        }

        const decoded = verifyToken(token);
        if (!decoded) {
          console.error(`❌ Client ${socket.id} failed to join: Invalid or expired token`);
          socket.emit('error', { message: 'Invalid or expired token' });
          return;
        }

        // Verify project ownership
        const project = await Project.findOne({ _id: projectId, owner: decoded.userId });
        if (!project) {
          console.error(`❌ Client ${socket.id} failed to join: Project not found or unauthorized`);
          socket.emit('error', { message: 'Project not found or unauthorized' });
          return;
        }

        const roomName = `project:${projectId}`;
        socket.join(roomName);
        console.log(`👤 Client ${socket.id} joined room ${roomName}`);

        // Send immediate initial active user count
        const count = await ActiveUsersService.getActiveUserCount(projectId);
        socket.emit('active-users', { count, timestamp: new Date().toISOString() });
      } catch (error) {
        console.error('Socket join:project error:', error);
        socket.emit('error', { message: 'Internal server error during join' });
      }
    });

    socket.on('leave:project', (payload: { projectId: string }) => {
      const roomName = `project:${payload.projectId}`;
      socket.leave(roomName);
      console.log(`👋 Client ${socket.id} left room ${roomName}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  // Start polling active users every 10 seconds for all active rooms
  setInterval(async () => {
    // Only broadcast to rooms that have clients connected
    const rooms = io.sockets.adapter.rooms;
    for (const [roomName, clientSet] of rooms.entries()) {
      if (roomName.startsWith('project:') && clientSet.size > 0) {
        const projectId = roomName.split(':')[1];
        if (projectId) {
          try {
            const count = await ActiveUsersService.getActiveUserCount(projectId);
            io.to(roomName).emit('active-users', { count, timestamp: new Date().toISOString() });
          } catch (error) {
            console.error(`Error broadcasting active users for project ${projectId}:`, error);
          }
        }
      }
    }
  }, 10000); // 10 seconds

  // Setup Redis Pub/Sub subscriber for live events
  const subscriber = redisConnection.duplicate();
  subscriber.psubscribe('realtime:*', (err, count) => {
    if (err) console.error('Failed to psubscribe:', err, count);
  });

  subscriber.on('pmessage', (pattern, channel, message) => {
    try {
      const projectId = channel.split(':')[1];
      const parsedMessage = JSON.parse(message);

      const roomName = `project:${projectId}`;

      io.to(roomName).emit(parsedMessage.type, parsedMessage.data);
    } catch (error) {
      console.error('Error handling pub/sub message:', error);
    }
  });
};
