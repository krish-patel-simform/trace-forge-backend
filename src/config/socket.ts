import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { setupSocketHandlers } from '../realtime/socket.handler.js';

let io: SocketIOServer;

export const initSocket = (httpServer: HttpServer) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*', // Adjust according to your frontend URL in production
      credentials: true,
    },
  });

  setupSocketHandlers(io);

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};
