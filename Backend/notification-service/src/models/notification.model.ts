import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: string;
  title: string;
  message: string;
  data: Record<string, any>;
  read: boolean;
  readAt?: Date;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'delivered' | 'failed';
  deliveredAt?: Date;
  deliveredChannels: string[];
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserPreferences extends Document {
  userId: mongoose.Types.ObjectId;
  email: string;
  name: string;
  pushTokens: Array<{
    token: string;
    platform: string;
    createdAt: Date;
    lastUsed?: Date;
  }>;
  disabledTypes: string[];
  channelPreferences: {
    email?: {
      enabled: boolean;
      disabledTypes: string[];
    };
    push?: {
      enabled: boolean;
      disabledTypes: string[];
    };
    app?: {
      enabled: boolean;
      disabledTypes: string[];
    };
    websocket?: {
      enabled: boolean;
      disabledTypes: string[];
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: Schema.Types.Mixed,
    default: {}
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'delivered', 'failed'],
    default: 'pending',
    index: true
  },
  deliveredAt: {
    type: Date
  },
  deliveredChannels: [{
    type: String,
    enum: ['app', 'email', 'push', 'websocket']
  }],
  expiresAt: {
    type: Date,
    index: true
  }
}, {
  timestamps: true
});

// Create compound indexes for common queries
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-expiry

const userPreferencesSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String
  },
  name: {
    type: String
  },
  pushTokens: [{
    token: {
      type: String,
      required: true
    },
    platform: {
      type: String,
      enum: ['ios', 'android', 'web'],
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastUsed: {
      type: Date
    }
  }],
  disabledTypes: [{
    type: String
  }],
  channelPreferences: {
    email: {
      enabled: {
        type: Boolean,
        default: true
      },
      disabledTypes: [{
        type: String
      }]
    },
    push: {
      enabled: {
        type: Boolean,
        default: true
      },
      disabledTypes: [{
        type: String
      }]
    },
    app: {
      enabled: {
        type: Boolean,
        default: true
      },
      disabledTypes: [{
        type: String
      }]
    },
    websocket: {
      enabled: {
        type: Boolean,
        default: true
      },
      disabledTypes: [{
        type: String
      }]
    }
  }
}, {
  timestamps: true
});

export const NotificationModel = mongoose.model<INotification>('Notification', notificationSchema);
export const UserPreferencesModel = mongoose.model<IUserPreferences>('UserPreferences', userPreferencesSchema);