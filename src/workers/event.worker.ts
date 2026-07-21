import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { Event } from '../models/event.model.js';
import { EVENT_QUEUE_NAME, type EventJobData } from '../services/eventQueue.service.js';

/**
 * BullMQ Worker — processes queued events and persists them to MongoDB.
 *
 * Each job holds the raw SDK event payload and the resolved projectId.
 * We do a simple upsert (via unique eventId index) to stay idempotent
 * even if the queue retries a job after a partial failure.
 */
export const startEventWorker = (): Worker<EventJobData> => {
  const worker = new Worker<EventJobData>(
    EVENT_QUEUE_NAME,
    async (job) => {
      const { event, projectId } = job.data;

      await Event.updateOne(
        { eventId: event.eventId },
        {
          $setOnInsert: {
            eventId: event.eventId,
            projectId,
            projectKey: event.projectKey,
            eventType: event.eventType,
            timestamp: new Date(event.timestamp),
            sdkVersion: event.sdkVersion,
            platform: event.platform,
            context: event.context,
            payload: event.payload,
          },
        },
        { upsert: true }
      );

      console.log(`[Worker] Processed event: ${event.eventType} (${event.eventId})`);
    },
    {
      connection: redisConnection,
      concurrency: 10,
    }
  );

  worker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id ?? 'unknown'} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id ?? 'unknown'} failed:`, err.message);
  });

  console.log('⚙️  Event worker started and listening...');
  return worker;
};
