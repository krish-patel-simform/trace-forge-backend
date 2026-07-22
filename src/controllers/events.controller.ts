import { type Response, type Request } from 'express';
import type { TraceForgeEvent } from '../types/events.type.js';
import { validateEvent } from '../validators/event.validator.js';
import { enqueueEvent } from '../services/eventQueue.service.js';
import { EventsPublisher } from '../realtime/events.publisher.js';
import { ActiveUsersService } from '../realtime/active-users.js';

/**
 * POST /api/events
 *
 * Authenticated via `sdkAuth` middleware which resolves `req.project`.
 * Validates the incoming event shape then pushes it onto the BullMQ queue
 * for async processing. The queue worker persists it to MongoDB.
 *
 * Fast-path: Immediately publishes realtime socket events prior to queue execution
 * to guarantee sub-10ms delivery latency to the live dashboard.
 */
export async function ingestEventController(
  req: Request<Record<string, string>, Record<string, unknown>, TraceForgeEvent>,
  res: Response
): Promise<void> {
  const result = validateEvent(req.body);

  if (!result.success) {
    res.status(400).json({ success: false, message: result.message });
    return;
  }

  // req.project is guaranteed to exist because sdkAuth runs before this handler
  const project = req.project!;
  const event = result.data;
  const projectId = project._id.toString();
  const sessionId = String(event.payload?.sessionId || 'unknown');
  const eventTimestamp = new Date(event.timestamp);

  // Fast-path: Realtime broadcasting for sub-10ms latency
  if (event.eventType === 'heartbeat') {
    ActiveUsersService.addActiveSession(projectId, sessionId)
      .then(async () => {
        const count = await ActiveUsersService.getActiveUserCount(projectId);
        await EventsPublisher.publishActiveUsers(projectId, count);
      })
      .catch((err) => console.error('Active session update error:', err));
  } else {
    let eventName = event.context.path || event.eventType;
    if (event.eventType === 'click') {
      eventName =
        (event.payload?.name as string) || (event.payload?.element as string) || 'Click';
    } else if (event.eventType === 'scroll') {
      eventName = (event.payload?.page as string) || 'Scroll';
    } else if (event.eventType === 'page_view') {
      eventName = (event.payload?.page_title as string) || event.context.path || 'Page View';
    } else if (event.eventType === 'search') {
      eventName = (event.payload?.query as string) || 'Search';
    } else if (event.eventType === 'custom') {
      eventName = (event.payload?.eventName as string) || 'Custom Event';
    }

    // Publish event summary immediately
    EventsPublisher.publishNewEvent(projectId, {
      type: event.eventType,
      name: eventName,
      sessionId,
      timestamp: eventTimestamp,
    }).catch((err) => console.error('Fast-path publish error:', err));
  }

  await enqueueEvent(event, project);

  res.status(202).json({ success: true, message: 'Event accepted' });
}
