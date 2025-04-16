import mongoose, { Schema, Document } from 'mongoose';

export interface IStorageFile extends Document {
  userId: mongoose.Types.ObjectId;
  fileId: string;
  fileName: string;
  fileKey: string;
  fileSize: number;
  fileType: string;
  isPublic: boolean;
  status: 'pending' | 'completed' | 'error';
  metadata: Record<string, any>;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const storageSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  fileId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileKey: {
    type: String,
    required: true,
    unique: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true,
    index: true
  },
  isPublic: {
    type: Boolean,
    default: false,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'error'],
    default: 'completed'
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  downloadCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create additional indexes for faster queries
storageSchema.index({ createdAt: -1 });
storageSchema.index({ fileType: 1, userId: 1 });

export const StorageModel = mongoose.model<IStorageFile>('StorageFile', storageSchema);