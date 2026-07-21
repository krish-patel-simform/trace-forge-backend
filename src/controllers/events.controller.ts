import { type Response, type Request } from 'express';
import type { TraceForgeEvent } from '../types/events.type.js';
import { validateEvent } from '../validators/event.validator.js';
import { enqueueEvent } from '../services/eventQueue.service.js';

/**
 * POST /api/events
 *
 * Authenticated via `sdkAuth` middleware which resolves `req.project`.
 * Validates the incoming event shape then pushes it onto the BullMQ queue
 * for async processing. The queue worker persists it to MongoDB.
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

  await enqueueEvent(result.data, project);

  res.status(202).json({ success: true, message: 'Event accepted' });
}
