import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { Event } from '../models/event.model.js';
import { Session } from '../models/session.model.js';
import { TrackedUser } from '../models/tracked-user.model.js';
import { EVENT_QUEUE_NAME, type EventJobData } from '../services/eventQueue.service.js';
import { ActiveUsersService } from '../realtime/active-users.js';
import { EventsPublisher } from '../realtime/events.publisher.js';

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

      const sessionId = String(event.payload?.sessionId || 'unknown');
      const userId = event.payload?.userId ? String(event.payload.userId) : null;
      const eventTimestamp = new Date(event.timestamp);

      if (event.eventType === 'heartbeat') {
        await ActiveUsersService.addActiveSession(projectId, sessionId);
        console.log(`[Worker] Processed heartbeat for session: ${sessionId}`);
      }

      await Event.updateOne(
        { eventId: event.eventId },
        {
          $setOnInsert: {
            eventId: event.eventId,
            projectId,
            projectKey: event.projectKey,
            eventType: event.eventType,
            timestamp: eventTimestamp,
            sdkVersion: event.sdkVersion,
            platform: event.platform,
            context: event.context,
            payload: event.payload,
          },
        },
        { upsert: true }
      );

      // Phase 10: Session Pre-aggregation
      if (sessionId && sessionId !== 'unknown') {
        const isPageView = event.eventType === 'pageview';
        const updateSession: Record<string, unknown> = {
          $setOnInsert: {
            projectId,
            sessionId,
            startedAt: eventTimestamp,
            entryPage: event.context.path,
            referrer: event.context.referrer || '',
            device: {
              type: String(event.payload?.deviceType || ''),
              browser: String(event.payload?.browser || ''),
              os: String(event.payload?.os || ''),
            },
            utm: {
              source: String(event.payload?.utmSource || ''),
              medium: String(event.payload?.utmMedium || ''),
              campaign: String(event.payload?.utmCampaign || ''),
            },
            isReturningUser: Boolean(event.payload?.isReturningUser),
          },
          $max: { endedAt: eventTimestamp },
          $set: {
            exitPage: event.context.path,
          },
          $inc: {
            eventCount: 1,
            pageCount: isPageView ? 1 : 0,
          },
        };

        if (userId) {
          (updateSession.$set as Record<string, unknown>).userId = userId;
        }

        await Session.updateOne(
          { projectId, sessionId },
          updateSession,
          { upsert: true }
        );
      }

      // Phase 10: User Pre-aggregation
      if (userId) {
        const updateUser: Record<string, unknown> = {
          $setOnInsert: {
            projectId,
            externalUserId: userId,
            firstSeen: eventTimestamp,
            totalSessions: 1, // Approximation
          },
          $max: { lastSeen: eventTimestamp },
          $inc: { totalEvents: 1 },
        };

        if (event.eventType === 'identify' && typeof event.payload === 'object') {
          // Store custom properties passed during identify
          updateUser.$set = { properties: event.payload };
        }

        await TrackedUser.updateOne(
          { projectId, externalUserId: userId },
          updateUser,
          { upsert: true }
        );
      }

      if (event.eventType !== 'heartbeat') {
        await EventsPublisher.publishNewEvent(projectId, {
          type: event.eventType,
          name: event.context.path || event.eventType,
          sessionId,
          timestamp: eventTimestamp,
        });
      }

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
