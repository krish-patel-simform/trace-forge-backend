import { Types } from 'mongoose';
import { Session } from '../models/session.model.js';
import { Event } from '../models/event.model.js';

export class SessionService {
  static async getSessions(
    projectId: Types.ObjectId,
    options: { page?: number; limit?: number }
  ) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const query = { projectId };

    const [sessions, total] = await Promise.all([
      Session.find(query)
        .sort({ startedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Session.countDocuments(query),
    ]);

    return {
      sessions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getSessionEvents(projectId: Types.ObjectId, sessionId: string) {
    const session = await Session.findOne({ projectId, sessionId }).lean();
    if (!session) {
      throw new Error('Session not found');
    }

    const events = await Event.find({ projectId, 'payload.sessionId': sessionId })
      .sort({ timestamp: 1 })
      .lean();

    return events;
  }
}
