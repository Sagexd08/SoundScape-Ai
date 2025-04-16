import mongoose, { Schema, Document } from 'mongoose';

export interface ISocialLinks {
  website?: string;
  twitter?: string;
  instagram?: string;
  soundcloud?: string;
  spotify?: string;
  youtube?: string;
}

export interface IPreferences {
  theme?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  privacySettings?: {
    profileVisibility: 'public' | 'followers' | 'private';
    activityVisibility: 'public' | 'followers' | 'private';
  };
  audioQuality?: 'low' | 'medium' | 'high';
  genrePreferences?: string[];
}

export interface IProfile extends Document {
  userId: mongoose.Types.ObjectId;
  displayName?: string;
  bio?: string;
  profilePicture?: string;
  headerImage?: string;
  location?: string;
  socialLinks?: ISocialLinks;
  preferences?: IPreferences;
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  badges: string[];
  createdAt: Date;
  updatedAt: Date;
}

const profileSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500
  },
  profilePicture: {
    type: String
  },
  headerImage: {
    type: String
  },
  location: {
    type: String,
    trim: true
  },
  socialLinks: {
    website: String,
    twitter: String,
    instagram: String,
    soundcloud: String,
    spotify: String,
    youtube: String
  },
  preferences: {
    theme: {
      type: String,
      default: 'auto'
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: true
    },
    privacySettings: {
      profileVisibility: {
        type: String,
        enum: ['public', 'followers', 'private'],
        default: 'public'
      },
      activityVisibility: {
        type: String,
        enum: ['public', 'followers', 'private'],
        default: 'public'
      }
    },
    audioQuality: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    genrePreferences: [String]
  },
  followers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  badges: [{
    type: String
  }]
}, {
  timestamps: true
});

// Create indexes for faster queries
profileSchema.index({ userId: 1 });
profileSchema.index({ 'followers': 1 });
profileSchema.index({ 'following': 1 });

export const ProfileModel = mongoose.model<IProfile>('Profile', profileSchema);