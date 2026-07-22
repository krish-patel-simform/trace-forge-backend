import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITrackedUser extends Document {
  projectId: Types.ObjectId;
  externalUserId: string;
  properties: Record<string, unknown>;
  firstSeen: Date;
  lastSeen: Date;
  totalSessions: number;
  totalEvents: number;
  createdAt: Date;
  updatedAt: Date;
}

const trackedUserSchema = new Schema<ITrackedUser>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    externalUserId: { type: String, required: true, index: true },
    properties: { type: Schema.Types.Mixed, default: {} },
    firstSeen: { type: Date, required: true },
    lastSeen: { type: Date, required: true },
    totalSessions: { type: Number, default: 0 },
    totalEvents: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

trackedUserSchema.index({ projectId: 1, externalUserId: 1 }, { unique: true });
trackedUserSchema.index({ projectId: 1, lastSeen: -1 });

export const TrackedUser = mongoose.model<ITrackedUser>('TrackedUser', trackedUserSchema);
