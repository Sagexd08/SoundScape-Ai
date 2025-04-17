import { createClient } from 'redis';
import { logger } from '../utils/logger';

// Create Redis client
const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';

/**
 * Cache Manager Service
 * 
 * Provides a simple interface for caching data using Redis
 */
class CacheManager {
  private client;
  private isConnected = false;

  constructor() {
    this.client = createClient({
      url: redisUrl
    });

    this.initialize();
  }

  /**
   * Initialize Redis connection
   */
  private async initialize() {
    try {
      // Set up event handlers
      this.client.on('error', (error) => {
        logger.error('Redis error:', error);
        this.isConnected = false;
      });

      this.client.on('reconnecting', () => {
        logger.info('Redis reconnecting...');
      });

      this.client.on('connect', () => {
        logger.info('Redis connected');
        this.isConnected = true;
      });

      // Connect to Redis
      await this.client.connect();
      logger.info('Cache service initialized');
    } catch (error) {
      logger.error('Error connecting to Redis:', error);
      this.isConnected = false;
    }
  }

  /**
   * Get value from cache
   * 
   * @param key Cache key
   * @returns Cached value or null if not found
   */
  async get(key: string): Promise<any> {
    try {
      if (!this.isConnected) {
        return null;
      }

      const data = await this.client.get(key);
      if (!data) {
        return null;
      }

      return JSON.parse(data);
    } catch (error) {
      logger.error(`Error getting cache key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache
   * 
   * @param key Cache key
   * @param value Value to cache
   * @param ttlSeconds Time to live in seconds
   * @returns Success status
   */
  async set(key: string, value: any, ttlSeconds: number = 3600): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false;
      }

      const serializedValue = JSON.stringify(value);
      await this.client.setEx(key, ttlSeconds, serializedValue);
      return true;
    } catch (error) {
      logger.error(`Error setting cache key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete value from cache
   * 
   * @param key Cache key
   * @returns Success status
   */
  async delete(key: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false;
      }

      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error(`Error deleting cache key ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear cache with pattern
   * 
   * @param pattern Key pattern to match
   * @returns Number of keys deleted
   */
  async clearPattern(pattern: string): Promise<number> {
    try {
      if (!this.isConnected) {
        return 0;
      }

      const keys = await this.client.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }

      const pipeline = this.client.multi();
      keys.forEach(key => {
        pipeline.del(key);
      });

      const results = await pipeline.exec();
      return keys.length;
    } catch (error) {
      logger.error(`Error clearing cache pattern ${pattern}:`, error);
      return 0;
    }
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();
