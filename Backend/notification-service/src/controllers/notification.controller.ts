import { Request, Response } from 'express';
import { NotificationModel } from '../models/notification.model';
import { UserPreferencesService } from '../services/user-preferences.service';
import { EmailService } from '../services/email.service';
import { PushNotificationService } from '../services/push-notification.service';
import { WebsocketService } from '../services/websocket.service';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';
import { NotificationTemplate, renderTemplate } from '../utils/template.utils';
import { NotificationQueue } from '../services/queue.service';

const userPreferencesService = new UserPreferencesService();
const emailService = new EmailService();
const pushService = new PushNotificationService();
const websocketService = new WebsocketService();
const notificationQueue = new NotificationQueue();

/**
 * Send notification
 */
export const sendNotification = async (req: Request, res: Response) => {
  try {
    const { userId, type, title, message, data, channels, priority } = req.body;
    
    if (!userId || !type || !title || !message) {
      return res.status(400).json({ message: 'User ID, type, title, and message are required' });
    }
    
    // Queue notification for processing
    await notificationQueue.add({
      userId,
      type,
      title,
      message,
      data: data || {},
      channels: channels || ['app', 'email', 'push'],
      priority: priority || 'normal'
    });
    
    res.status(202).json({ message: 'Notification queued for delivery' });
  } catch (error) {
    logger.error('Error sending notification:', error);
    res.status(500).json({ message: 'Server error while sending notification' });
  }
};

/**
 * Process and deliver notification
 * This is called by the worker processing the notification queue
 */
export const processNotification = async (notification: any) => {
  try {
    const { userId, type, title, message, data, channels, priority } = notification;
    
    // Get user notification preferences
    const userPreferences = await userPreferencesService.getUserPreferences(userId);
    
    // Check if user has opted out of this notification type
    if (userPreferences?.disabledTypes?.includes(type)) {
      logger.info(`User ${userId} has opted out of notification type: ${type}`);
      return;
    }
    
    // Create notification record
    const notificationRecord = new NotificationModel({
      userId,
      type,
      title,
      message,
      data,
      priority
    });
    
    await notificationRecord.save();
    
    // Filter delivery channels based on user preferences
    const enabledChannels = channels.filter(channel => {
      // Check if user has disabled this channel for this type
      const channelPref = userPreferences?.channelPreferences?.[channel];
      return channelPref?.enabled !== false && 
             !channelPref?.disabledTypes?.includes(type);
    });
    
    // Deliver through each enabled channel
    const deliveryPromises = [];
    
    if (enabledChannels.includes('app')) {
      // In-app notification (stored in database)
      deliveryPromises.push(Promise.resolve());
    }
    
    if (enabledChannels.includes('email') && userPreferences?.email) {
      // Email notification
      const emailTemplate = getEmailTemplate(type);
      const emailHtml = renderTemplate(emailTemplate, {
        title,
        message,
        ...data,
        userName: userPreferences.name || 'User'
      });
      
      deliveryPromises.push(
        emailService.sendEmail({
          to: userPreferences.email,
          subject: title,
          html: emailHtml
        })
      );
    }
    
    if (enabledChannels.includes('push') && userPreferences?.pushTokens?.length) {
      // Push notification
      deliveryPromises.push(
        pushService.sendPushNotification({
          tokens: userPreferences.pushTokens,
          title,
          body: message,
          data
        })
      );
    }
    
    if (enabledChannels.includes('websocket')) {
      // Real-time websocket notification
      deliveryPromises.push(
        websocketService.sendToUser(userId, {
          type: 'notification',
          notificationId: notificationRecord._id,
          title,
          message,
          data,
          timestamp: notificationRecord.createdAt
        })
      );
    }
    
    // Wait for all delivery methods to complete
    await Promise.all(deliveryPromises);
    
    // Update notification record with delivery status
    notificationRecord.status = 'delivered';
    notificationRecord.deliveredAt = new Date();
    notificationRecord.deliveredChannels = enabledChannels;
    await notificationRecord.save();
    
    logger.info(`Notification ${notificationRecord._id} delivered to user ${userId} via ${enabledChannels.join(', ')}`);
  } catch (error) {
    logger.error('Error processing notification:', error);
    throw error;
  }
};

/**
 * Get user notifications
 */
export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const unreadOnly = req.query.unread === 'true';
    
    // Build query
    const query: any = { userId };
    
    if (unreadOnly) {
      query.read = false;
    }
    
    // Get total count
    const totalNotifications = await NotificationModel.countDocuments(query);
    
    // Get notifications
    const notifications = await NotificationModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    res.status(200).json({
      notifications,
      pagination: {
        total: totalNotifications,
        page,
        limit,
        pages: Math.ceil(totalNotifications / limit)
      }
    });
  } catch (error) {
    logger.error('Error getting user notifications:', error);
    res.status(500).json({ message: 'Server error while fetching notifications' });
  }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;
    
    const notification = await NotificationModel.findOne({
      _id: notificationId,
      userId
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    notification.read = true;
    notification.readAt = new Date();
    await notification.save();
    
    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error while updating notification' });
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    
    await NotificationModel.updateMany(
      { userId, read: false },
      { 
        $set: { 
          read: true,
          readAt: new Date()
        }
      }
    );
    
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    logger.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error while updating notifications' });
  }
};

/**
 * Delete notification
 */
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;
    
    const notification = await NotificationModel.findOne({
      _id: notificationId,
      userId
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    await notification.remove();
    
    res.status(200).json({ message: 'Notification deleted' });
  } catch (error) {
    logger.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Server error while deleting notification' });
  }
};

/**
 * Update notification preferences
 */
export const updateNotificationPreferences = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const preferences = req.body;
    
    // Validate preferences object
    if (!preferences) {
      return res.status(400).json({ message: 'Preferences are required' });
    }
    
    // Update user preferences
    await userPreferencesService.updatePreferences(userId, preferences);
    
    res.status(200).json({ message: 'Notification preferences updated' });
  } catch (error) {
    logger.error('Error updating notification preferences:', error);
    res.status(500).json({ message: 'Server error while updating preferences' });
  }
};

/**
 * Register push notification token
 */
export const registerPushToken = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { token, platform } = req.body;
    
    if (!token || !platform) {
      return res.status(400).json({ message: 'Token and platform are required' });
    }
    
    // Add token to user preferences
    await userPreferencesService.addPushToken(userId, token, platform);
    
    res.status(200).json({ message: 'Push token registered successfully' });
  } catch (error) {
    logger.error('Error registering push token:', error);
    res.status(500).json({ message: 'Server error while registering push token' });
  }
};

/**
 * Get email template for notification type
 */
const getEmailTemplate = (type: string): NotificationTemplate => {
  const templates: Record<string, NotificationTemplate> = {
    'new_follower': {
      subject: 'New Follower on SoundScape-AI',
      template: 'new-follower'
    },
    'track_like': {
      subject: 'Someone liked your track',
      template: 'track-like'
    },
    'track_comment': {
      subject: 'New comment on your track',
      template: 'track-comment'
    },
    'playlist_follow': {
      subject: 'Someone followed your playlist',
      template: 'playlist-follow'
    },
    'artist_update': {
      subject: 'New update from an artist you follow',
      template: 'artist-update'
    },
    'system_alert': {
      subject: 'Important SoundScape-AI Alert',
      template: 'system-alert'
    }
  };
  
  return templates[type] || {
    subject: 'SoundScape-AI Notification',
    template: 'generic'
  };
};