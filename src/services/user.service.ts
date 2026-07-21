import { Types } from 'mongoose';
import { TrackedUser } from '../models/tracked-user.model.js';
import { Session } from '../models/session.model.js';

export class UserService {
  static async getUsers(
    projectId: Types.ObjectId,
    options: { page?: number; limit?: number }
  ) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const query = { projectId };

    const [users, total] = await Promise.all([
      TrackedUser.find(query)
        .sort({ lastSeen: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      TrackedUser.countDocuments(query),
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getUserProfile(projectId: Types.ObjectId, userId: string) {
    const user = await TrackedUser.findOne({ projectId, externalUserId: userId }).lean();
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  static async getUserSessions(
    projectId: Types.ObjectId,
    userId: string,
    options: { page?: number; limit?: number }
  ) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const query = { projectId, userId };

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
}
