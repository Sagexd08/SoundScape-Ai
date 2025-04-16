import mongoose, { Schema, Document } from 'mongoose';

export interface IToken extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  type: 'refresh' | 'access' | 'verification' | 'reset';
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const tokenSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['refresh', 'access', 'verification', 'reset'],
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
tokenSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for token expiration
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const TokenModel = mongoose.model<IToken>('Token', tokenSchema);
