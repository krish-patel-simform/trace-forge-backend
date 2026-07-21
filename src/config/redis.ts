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

/**
 * Creates a fresh Redis connection suitable for Pub/Sub.
 * Must NOT inherit the BullMQ-specific settings (`maxRetriesPerRequest: null`,
 * `enableReadyCheck: false`) as those interfere with psubscribe/subscribe commands.
 */
export const createPubSubConnection = (): Redis => {
  const conn = new Redis(env.REDIS_URL, {
    lazyConnect: false,
  });

  conn.on('connect', () => {
    console.log('✅ Redis Pub/Sub connection established');
  });

  conn.on('error', (err: Error) => {
    console.error('❌ Redis Pub/Sub connection error:', err.message);
  });

  return conn;
};
