import mongoose, { Document, Schema, Types } from 'mongoose';
import { EVENT_TYPES } from '../constants/events-types.js';

type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

export interface IEvent extends Document {
  eventId: string;
  projectId: Types.ObjectId;
  projectKey: string;
  eventType: EventType;
  timestamp: Date;
  sdkVersion: string;
  platform: 'web';
  context: {
    url: string;
    path: string;
    title?: string;
    referrer?: string;
  };
  payload: Record<string, unknown>;
}

const eventSchema = new Schema<IEvent>(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    projectKey: { type: String, required: true },
    eventType: {
      type: String,
      required: true,
      enum: Object.values(EVENT_TYPES),
    },
    timestamp: { type: Date, required: true },
    sdkVersion: { type: String, required: true },
    platform: { type: String, enum: ['web'], default: 'web' },
    context: {
      url: { type: String, required: true },
      path: { type: String, required: true },
      title: { type: String },
      referrer: { type: String },
    },
    payload: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    // Use a TTL index on the `timestamp` field driven by the project's
    // dataRetentionDays setting. For simplicity we keep the document indefinitely
    // and let a scheduled job prune based on the project setting later.
  }
);

// Compound index to efficiently query events per project sorted by time
eventSchema.index({ projectId: 1, timestamp: -1 });

export const Event = mongoose.model<IEvent>('Event', eventSchema);
