import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { UserModel } from '../models/user.model';
import { ProfileModel } from '../models/profile.model';
import { logger } from '../utils/logger';
import { AppError } from '../utils/error-handler';
import mongoose from 'mongoose';
import { StorageService } from '../services/storage.service';

// Import multer types
import { Multer } from 'multer';

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
      file?: Multer.File;
    }
  }
}

const storageService = new StorageService();

/**
 * Get current user profile
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await UserModel.findById(userId).select('-password');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const profile = await ProfileModel.findOne({ userId });

    res.status(200).json({
      user,
      profile: profile || { userId }
    });
  } catch (error) {
    logger.error('Error getting current user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { displayName, bio, preferences, socialLinks } = req.body;

    let profile = await ProfileModel.findOne({ userId });

    if (profile) {
      profile.displayName = displayName || profile.displayName;
      profile.bio = bio || profile.bio;

      if (preferences) {
        profile.preferences = {
          ...profile.preferences,
          ...preferences
        };
      }

      if (socialLinks) {
        profile.socialLinks = {
          ...profile.socialLinks,
          ...socialLinks
        };
      }

      await profile.save();
    } else {
      profile = new ProfileModel({
        userId,
        displayName,
        bio,
        preferences,
        socialLinks
      });

      await profile.save();
    }

    res.status(200).json(profile);
  } catch (error) {
    logger.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Upload profile picture
 */
export const uploadProfilePicture = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const fileBuffer = req.file.buffer;
    const fileType = req.file.mimetype;
    const fileName = `profile-pictures/${userId}-${Date.now()}.${req.file.originalname.split('.').pop()}`;

    const imageUrl = await storageService.uploadFile(fileBuffer, fileName, fileType);

    let profile = await ProfileModel.findOne({ userId });

    if (profile) {
      if (profile.profilePicture) {
        await storageService.deleteFile(profile.profilePicture);
      }

      profile.profilePicture = imageUrl;
      await profile.save();
    } else {
      profile = new ProfileModel({
        userId,
        profilePicture: imageUrl
      });

      await profile.save();
    }

    res.status(200).json({
      message: 'Profile picture uploaded successfully',
      profilePicture: imageUrl
    });
  } catch (error) {
    logger.error('Error uploading profile picture:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get user by ID (public profile)
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await UserModel.findById(userId).select('name email createdAt');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const profile = await ProfileModel.findOne({ userId }).select('-preferences');

    res.status(200).json({
      user,
      profile: profile || {}
    });
  } catch (error) {
    logger.error('Error getting user by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get user activity
 */
export const getUserActivity = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    res.status(200).json({
      recentListens: [],
      recentUploads: [],
      recentComments: []
    });
  } catch (error) {
    logger.error('Error getting user activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Follow user
 */
export const followUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { targetUserId } = req.params;

    if (userId === targetUserId) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const targetUser = await UserModel.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUserProfile = await ProfileModel.findOne({ userId });
    const targetUserProfile = await ProfileModel.findOne({ userId: targetUserId });

    if (!currentUserProfile) {
      const newProfile = new ProfileModel({
        userId,
        following: [targetUserId]
      });

      await newProfile.save();
    } else if (currentUserProfile.following.some(id => id.toString() === targetUserId)) {
      return res.status(400).json({ message: 'Already following this user' });
    } else {
      currentUserProfile.following.push(new mongoose.Types.ObjectId(targetUserId));
      await currentUserProfile.save();
    }

    if (!targetUserProfile) {
      const newTargetProfile = new ProfileModel({
        userId: targetUserId,
        followers: [userId]
      });

      await newTargetProfile.save();
    } else {
      targetUserProfile.followers.push(new mongoose.Types.ObjectId(userId));
      await targetUserProfile.save();
    }

    res.status(200).json({ message: 'User followed successfully' });
  } catch (error) {
    logger.error('Error following user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Unfollow user
 */
export const unfollowUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { targetUserId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const currentUserProfile = await ProfileModel.findOne({ userId });
    const targetUserProfile = await ProfileModel.findOne({ userId: targetUserId });

    if (!currentUserProfile || !targetUserProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    currentUserProfile.following = currentUserProfile.following.filter(
      (id) => id.toString() !== targetUserId
    );
    await currentUserProfile.save();

    targetUserProfile.followers = targetUserProfile.followers.filter(
      (id) => id.toString() !== userId
    );
    await targetUserProfile.save();

    res.status(200).json({ message: 'User unfollowed successfully' });
  } catch (error) {
    logger.error('Error unfollowing user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get user stats
 */
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const profile = await ProfileModel.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const followersCount = profile.followers.length;
    const followingCount = profile.following.length;

    const uploadsCount = 0;
    const totalListens = 0;

    res.status(200).json({
      followersCount,
      followingCount,
      uploadsCount,
      totalListens
    });
  } catch (error) {
    logger.error('Error getting user stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};