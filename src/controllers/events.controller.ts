import { type Response, type Request } from 'express';
import type { TraceForgeEvent } from '../types/events.type.ts';
import { validateEvent } from '../validators/event.validator.ts';

export function checkEventController(req: Request<null, null, TraceForgeEvent>, res: Response) {
  const result = validateEvent(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.message,
    });
  }

  console.log(req.body);

  return res.status(200).json({ success: true });
}
