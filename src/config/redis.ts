import { Redis } from 'ioredis';
import { env } from './env.js';

/**
 * Shared IORedis connection used by both the BullMQ Queue and Worker.
 * `maxRetriesPerRequest: null` is required by BullMQ for blocking commands.
 */
export const redisConnection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redisConnection.on('connect', () => {
  console.log('✅ Redis connected');
});

redisConnection.on('error', (err: Error) => {
  console.error('❌ Redis connection error:', err.message);
});
