import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  userId: mongoose.Types.ObjectId | null;
  eventType: string;
  entityId: string;
  properties: Record<string, any>;
  clientIp: string;
  userAgent: string;
  timestamp: Date;
}

export interface IAnalytics extends Document {
  entityId: string;
  entityType: string;
  playCount: number;
  likeCount: number;
  shareCount: number;
  downloadCount: number;
  commentCount: number;
  avgCompletionRate: number;
  uniqueListeners: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Schema for tracking individual events
const eventSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    sparse: true
  },
  eventType: {
    type: String,
    required: true,
    index: true
  },
  entityId: {
    type: String,
    index: true
  },
  properties: {
    type: Schema.Types.Mixed,
    default: {}
  },
  clientIp: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Create compound indexes for faster queries
eventSchema.index({ entityId: 1, eventType: 1, timestamp: -1 });
eventSchema.index({ userId: 1, eventType: 1, timestamp: -1 });

// Schema for aggregated analytics
const analyticsSchema: Schema = new Schema({
  entityId: {
    type: String,
    required: true,
    index: true
  },
  entityType: {
    type: String,
    required: true,
    enum: ['track', 'album', 'playlist', 'artist', 'user'],
    index: true
  },
  playCount: {
    type: Number,
    default: 0
  },
  likeCount: {
    type: Number,
    default: 0
  },
  shareCount: {
    type: Number,
    default: 0
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  commentCount: {
    type: Number,
    default: 0
  },
  avgCompletionRate: {
    type: Number,
    default: 0
  },
  uniqueListeners: [{
    type: String
  }]
}, {
  timestamps: true
});

// Create compound index
analyticsSchema.index({ entityType: 1, playCount: -1 });
analyticsSchema.index({ entityType: 1, likeCount: -1 });

export const EventModel = mongoose.model<IEvent>('Event', eventSchema);
export const AnalyticsModel = mongoose.model<IAnalytics>('Analytics', analyticsSchema);