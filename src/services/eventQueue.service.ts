import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import type { TraceForgeEvent } from '../types/events.type.js';
import type { IProject } from '../models/project.model.js';

export const EVENT_QUEUE_NAME = 'traceforge_events';

/**
 * Job data shape stored in the queue.
 * We resolve the full project document here so the worker
 * doesn't need to do a DB look-up on every job.
 */
export interface EventJobData {
  event: TraceForgeEvent;
  projectId: string;
}

/**
 * BullMQ Queue for incoming SDK events.
 * Jobs are pushed here by the controller and consumed by the worker.
 */
export const eventQueue = new Queue<EventJobData>(EVENT_QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: 1000,
    removeOnFail: 500,
  },
});

/**
 * Push a single SDK event onto the queue.
 */
export const enqueueEvent = async (event: TraceForgeEvent, project: IProject): Promise<void> => {
  await eventQueue.add(
    event.eventType,
    { event, projectId: project._id.toString() },
    { jobId: event.eventId } // idempotency: duplicate SDK retries are deduplicated
  );
};
