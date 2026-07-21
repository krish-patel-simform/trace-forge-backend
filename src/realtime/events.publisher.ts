import { redisConnection } from '../config/redis.js';

export class EventsPublisher {
  /**
   * Publishes an event summary to the realtime channel for a project.
   */
  static async publishNewEvent(
    projectId: string,
    eventSummary: { type: string; name: string; sessionId: string; timestamp: Date }
  ): Promise<void> {
    const channel = `realtime:${projectId}`;
    await redisConnection.publish(channel, JSON.stringify({ type: 'new-event', data: eventSummary }));
  }
}
