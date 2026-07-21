import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProject extends Document {
  name: string;
  websiteUrl?: string;
  description?: string;
  apiKeyHash: string;
  apiKeyPrefix: string;
  owner: Types.ObjectId;
  settings: {
    timezone: string;
    dataRetentionDays: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true },
    websiteUrl: { type: String, trim: true },
    description: { type: String, trim: true },
    apiKeyHash: { type: String, required: true, index: true },
    apiKeyPrefix: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    settings: {
      timezone: { type: String, default: 'UTC' },
      dataRetentionDays: { type: Number, default: 90 },
    },
  },
  {
    timestamps: true,
  }
);

// Enforce unique project name per owner
projectSchema.index({ name: 1, owner: 1 }, { unique: true });

// Remove hash from JSON output
projectSchema.methods.toJSON = function () {
  const project = this.toObject();
  delete project.apiKeyHash;
  return project;
};

export const Project = mongoose.model<IProject>('Project', projectSchema);
