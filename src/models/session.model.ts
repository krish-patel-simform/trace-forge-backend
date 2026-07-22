import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISession extends Document {
  sessionId: string;
  projectId: Types.ObjectId;
  userId: string | null;
  startedAt: Date;
  endedAt: Date;
  duration: number;
  pageCount: number;
  eventCount: number;
  entryPage: string;
  exitPage: string;
  device: {
    type?: string;
    browser?: string;
    os?: string;
  };
  referrer: string;
  utm: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
  isReturningUser: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    userId: { type: String, default: null, index: true },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, required: true },
    duration: { type: Number, default: 0 },
    pageCount: { type: Number, default: 0 },
    eventCount: { type: Number, default: 0 },
    entryPage: { type: String, default: '' },
    exitPage: { type: String, default: '' },
    device: {
      type: { type: String },
      browser: { type: String },
      os: { type: String },
    },
    referrer: { type: String, default: '' },
    utm: {
      source: { type: String },
      medium: { type: String },
      campaign: { type: String },
    },
    isReturningUser: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

sessionSchema.index({ projectId: 1, startedAt: -1 });

export const Session = mongoose.model<ISession>('Session', sessionSchema);
