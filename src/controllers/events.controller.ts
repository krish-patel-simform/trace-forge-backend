import { type Response, type Request } from 'express';
import type { TraceForgeEvent } from '../types/events.type.ts';

export function checkEventController(req: Request<null, null, TraceForgeEvent>, res: Response) {
  console.log(req.body);

  return res.status(200).json({ success: true });
}
