import { Request, Response } from 'express';
import { AnalyticsModel, EventModel } from '../models/analytics.model';
import { cacheManager } from '../services/cache.service';
import { kafkaProducer } from '../services/kafka.service';
import { generateDateRangeQuery, generateTimeSeriesAggregation } from '../utils/date.utils';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

/**
 * Track event
 *
 * Records user events for analytics
 */
export const trackEvent = async (req: Request, res: Response) => {
  try {
    const { eventType, entityId, properties } = req.body;
    const userId = req.user?.id || null;
    
    if (!eventType) {
      return res.status(400).json({ message: 'Event type is required' });
    }
    
    // Validate event type
    const validEventTypes = [
      'track_play', 'track_pause', 'track_complete', 'track_skip',
      'track_like', 'track_download', 'track_share',
      'user_login', 'user_signup', 'user_follow', 'user_unfollow',
      'playlist_create', 'playlist_update', 'playlist_delete', 'playlist_follow',
      'search_query', 'recommendation_click', 'page_view'
    ];
    
    if (!validEventTypes.includes(eventType)) {
      return res.status(400).json({ message: 'Invalid event type' });
    }
    
    // Create event
    const event = new EventModel({
      userId,
      eventType,
      entityId,
      properties,
      clientIp: req.ip,
      userAgent: req.headers['user-agent'],
      timestamp: new Date()
    });
    
    await event.save();
    
    // Send event to Kafka for real-time processing
    await kafkaProducer.send({
      topic: 'analytics-events',
      messages: [
        { 
          key: eventType, 
          value: JSON.stringify({
            userId,
            eventType,
            entityId,
            properties,
            timestamp: new Date().toISOString()
          }) 
        }
      ]
    });
    
    // If this is a track play event, update analytics counters
    if (eventType === 'track_play' && entityId) {
      await updatePlayCount(entityId, userId);
    }
    
    res.status(201).json({ message: 'Event tracked successfully' });
  } catch (error) {
    logger.error('Error tracking event:', error);
    res.status(500).json({ message: 'Server error while tracking event' });
  }
};

/**
 * Get user activity analytics
 */
export const getUserActivityAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId || req.user.id;
    const period = req.query.period as string || '30d'; // Default 30 days
    
    // Check for admin access if not requesting own data
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Check cache
    const cacheKey = `user-activity:${userId}:${period}`;
    const cachedData = await cacheManager.get(cacheKey);
    
    if (cachedData) {
      return res.status(200).json(cachedData);
    }
    
    // Build date range filter based on period
    const dateFilter = generateDateRangeQuery(period);
    
    // Aggregate user activity
    const activityData = await EventModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          timestamp: dateFilter
        }
      },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Get time series data for track plays
    const timeSeriesData = await EventModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          eventType: 'track_play',
          timestamp: dateFilter
        }
      },
      generateTimeSeriesAggregation(period)
    ]);
    
    // Get most played tracks
    const mostPlayedTracks = await EventModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          eventType: 'track_play',
          timestamp: dateFilter
        }
      },
      {
        $group: {
          _id: '$entityId',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);
    
    // Get track metadata
    const trackIds = mostPlayedTracks.map(track => track._id);
    const tracksMetadata = await fetchTracksMetadata(trackIds);
    
    // Combine with track metadata
    const tracksWithMetadata = mostPlayedTracks.map(track => {
      const metadata = tracksMetadata.find(t => t.trackId === track._id);
      return {
        trackId: track._id,
        playCount: track.count,
        title: metadata?.title || 'Unknown Track',
        artist: metadata?.artist || 'Unknown Artist',
        coverArt: metadata?.coverArt || null
      };
    });
    
    const result = {
      userId,
      period,
      activitySummary: activityData,
      playTimeSeries: timeSeriesData,
      mostPlayedTracks: tracksWithMetadata
    };
    
    // Cache results
    await cacheManager.set(cacheKey, result, 60 * 30); // 30 minutes
    
    res.status(200).json(result);
  } catch (error) {
    logger.error('Error getting user activity analytics:', error);
    res.status(500).json({ message: 'Server error while fetching analytics' });
  }
};

/**
 * Get content analytics
 */
export const getContentAnalytics = async (req: Request, res: Response) => {
  try {
    const { contentId } = req.params;
    const period = req.query.period as string || '30d'; // Default 30 days
    
    // Validate content ID
    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      return res.status(400).json({ message: 'Invalid content ID' });
    }
    
    // Check cache
    const cacheKey = `content-analytics:${contentId}:${period}`;
    const cachedData = await cacheManager.get(cacheKey);
    
    if (cachedData) {
      return res.status(200).json(cachedData);
    }
    
    // Build date range filter based on period
    const dateFilter = generateDateRangeQuery(period);
    
    // Get content analytics
    const contentAnalytics = await AnalyticsModel.findOne({ entityId: contentId });
    
    // Get detailed events breakdown
    const eventsBreakdown = await EventModel.aggregate([
      {
        $match: {
          entityId: contentId,
          timestamp: dateFilter
        }
      },
      {
        $group: {
          _id: {
            eventType: '$eventType',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);
    
    // Convert to time series format
    const timeSeriesData = {};
    eventsBreakdown.forEach(item => {
      const eventType = item._id.eventType;
      const date = item._id.date;
      
      if (!timeSeriesData[eventType]) {
        timeSeriesData[eventType] = [];
      }
      
      timeSeriesData[eventType].push({
        date,
        count: item.count
      });
    });
    
    // Get demographic data
    const demographicData = await EventModel.aggregate([
      {
        $match: {
          entityId: contentId,
          eventType: 'track_play',
          timestamp: dateFilter
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: {
          path: '$userInfo',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: {
            country: '$userInfo.country',
            age: '$userInfo.age',
            gender: '$userInfo.gender'
          },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Format demographic data
    const demographics = {
      countries: {},
      ageGroups: {},
      genders: {}
    };
    
    demographicData.forEach(item => {
      if (item._id.country) {
        demographics.countries[item._id.country] = (demographics.countries[item._id.country] || 0) + item.count;
      }
      
      if (item._id.age) {
        const ageGroup = getAgeGroup(item._id.age);
        demographics.ageGroups[ageGroup] = (demographics.ageGroups[ageGroup] || 0) + item.count;
      }
      
      if (item._id.gender) {
        demographics.genders[item._id.gender] = (demographics.genders[item._id.gender] || 0) + item.count;
      }
    });
    
    const result = {
      contentId,
      period,
      totalPlays: contentAnalytics?.playCount || 0,
      totalLikes: contentAnalytics?.likeCount || 0,
      totalShares: contentAnalytics?.shareCount || 0,
      totalDownloads: contentAnalytics?.downloadCount || 0,
      avgCompletionRate: contentAnalytics?.avgCompletionRate || 0,
      timeSeriesData,
      demographics
    };
    
    // Cache results
    await cacheManager.set(cacheKey, result, 60 * 30); // 30 minutes
    
    res.status(200).json(result);
  } catch (error) {
    logger.error('Error getting content analytics:', error);
    res.status(500).json({ message: 'Server error while fetching content analytics' });
  }
};

/**
 * Get global platform analytics
 */
export const getPlatformAnalytics = async (req: Request, res: Response) => {
  try {
    // Check for admin access
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const period = req.query.period as string || '30d'; // Default 30 days
    
    // Check cache
    const cacheKey = `platform-analytics:${period}`;
    const cachedData = await cacheManager.get(cacheKey);
    
    if (cachedData) {
      return res.status(200).json(cachedData);
    }
    
    // Build date range filter based on period
    const dateFilter = generateDateRangeQuery(period);
    
    // Get active users
    const activeUsers = await EventModel.aggregate([
      {
        $match: {
          timestamp: dateFilter,
          userId: { $ne: null }
        }
      },
      {
        $group: {
          _id: '$userId'
        }
      },
      {
        $count: 'count'
      }
    ]);
    
    // Get new users
    const newUsers = await EventModel.aggregate([
      {
        $match: {
          timestamp: dateFilter,
          eventType: 'user_signup'
        }
      },
      {
        $count: 'count'
      }
    ]);
    
    // Get content upload stats
    const contentUploads = await EventModel.aggregate([
      {
        $match: {
          timestamp: dateFilter,
          eventType: 'track_upload'
        }
      },
      {
        $count: 'count'
      }
    ]);
    
    // Get total plays
    const totalPlays = await EventModel.aggregate([
      {
        $match: {
          timestamp: dateFilter,
          eventType: 'track_play'
        }
      },
      {
        $count: 'count'
      }
    ]);
    
    // Get daily active users time series
    const dailyActiveUsers = await EventModel.aggregate([
      {
        $match: {
          timestamp: dateFilter,
          userId: { $ne: null }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            userId: '$userId'
          }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);
    
    // Get most popular tracks
    const popularTracks = await AnalyticsModel.find({
      entityType: 'track',
      updatedAt: dateFilter
    })
    .sort({ playCount: -1 })
    .limit(10);
    
    // Get track metadata
    const trackIds = popularTracks.map(track => track.entityId);
    const tracksMetadata = await fetchTracksMetadata(trackIds);
    
    // Combine with track metadata
    const tracksWithMetadata = popularTracks.map(track => {
      const metadata = tracksMetadata.find(t => t.trackId === track.entityId);
      return {
        trackId: track.entityId,
        playCount: track.playCount,
        likeCount: track.likeCount,
        shareCount: track.shareCount,
        title: metadata?.title || 'Unknown Track',
        artist: metadata?.artist || 'Unknown Artist',
        coverArt: metadata?.coverArt || null
      };
    });
    
    const result = {
      period,
      activeUsers: activeUsers[0]?.count || 0,
      newUsers: newUsers[0]?.count || 0,
      contentUploads: contentUploads[0]?.count || 0,
      totalPlays: totalPlays[0]?.count || 0,
      dailyActiveUsers: dailyActiveUsers.map(day => ({
        date: day._id,
        count: day.count
      })),
      popularTracks: tracksWithMetadata
    };
    
    // Cache results
    await cacheManager.set(cacheKey, result, 60 * 15); // 15 minutes
    
    res.status(200).json(result);
  } catch (error) {
    logger.error('Error getting platform analytics:', error);
    res.status(500).json({ message: 'Server error while fetching platform analytics' });
  }
};

/**
 * Update play count
 * 
 * Helper function to update analytics counters for a track
 */
const updatePlayCount = async (trackId: string, userId: string | null) => {
  try {
    // Find existing analytics or create new
    let analytics = await AnalyticsModel.findOne({ entityId: trackId, entityType: 'track' });
    
    if (!analytics) {
      analytics = new AnalyticsModel({
        entityId: trackId,
        entityType: 'track',
        playCount: 1,
        uniqueListeners: userId ? [userId] : []
      });
    } else {
      // Increment play count
      analytics.playCount += 1;
      
      // Add unique listener if not already counted
      if (userId && !analytics.uniqueListeners.includes(userId)) {
        analytics.uniqueListeners.push(userId);
      }
    }
    
    await analytics.save();
  } catch (error) {
    logger.error('Error updating play count:', error);
  }
};

/**
 * Fetch tracks metadata
 * 
 * Helper function to fetch metadata for tracks from the content service
 */
const fetchTracksMetadata = async (trackIds: string[]) => {
  try {
    // In a real implementation, this would call the content/audio service
    // For simplicity, we're using a mock implementation
    return trackIds.map(trackId => ({
      trackId,
      title: `Track ${trackId.substring(0, 5)}`,
      artist: `Artist ${trackId.substring(5, 10)}`,
      coverArt: `https://placeholder.com/300x300?text=${trackId.substring(0, 5)}`
    }));
  } catch (error) {
    logger.error('Error fetching tracks metadata:', error);
    return [];
  }
};

/**
 * Get age group from age
 * 
 * Helper function to categorize age into groups
 */
const getAgeGroup = (age: number) => {
  if (age < 18) return '< 18';
  if (age < 25) return '18-24';
  if (age < 35) return '25-34';
  if (age < 45) return '35-44';
  if (age < 55) return '45-54';
  return '55+';
};