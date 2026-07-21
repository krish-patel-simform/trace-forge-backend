import { redisConnection } from '../config/redis.js';

const ACTIVE_USER_TTL = 90; // seconds

export class ActiveUsersService {
  /**
   * Refreshes or creates an active session.
   */
  static async addActiveSession(projectId: string, sessionId: string): Promise<void> {
    const key = `active:${projectId}:${sessionId}`;
    // Set key with an expiration (TTL) of 90 seconds
    await redisConnection.setex(key, ACTIVE_USER_TTL, '1');
  }

  /**
   * Counts active sessions for a specific project.
   */
  static async getActiveUserCount(projectId: string): Promise<number> {
    let cursor = '0';
    let count = 0;
    const matchPattern = `active:${projectId}:*`;

    do {
      const [newCursor, keys] = await redisConnection.scan(cursor, 'MATCH', matchPattern, 'COUNT', 100);
      cursor = newCursor;
      count += keys.length;
    } while (cursor !== '0');

    return count;
  }
}
