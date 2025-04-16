import { createClient } from 'redis';
import { logger } from '../utils/logger';

// Create Redis client
const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';

// Create Redis client
export const redisClient = createClient({
  url: redisUrl
});

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
    logger.info('Connected to Redis');
  } catch (error) {
    logger.error('Error connecting to Redis:', error);
  }
})();

// Handle Redis errors
redisClient.on('error', (error) => {
  logger.error('Redis error:', error);
});

// Handle Redis reconnection
redisClient.on('reconnecting', () => {
  logger.info('Redis reconnecting...');
});

// Handle Redis connection
redisClient.on('connect', () => {
  logger.info('Redis connected');
});

// Handle process exit
process.on('SIGINT', async () => {
  await redisClient.quit();
  logger.info('Redis client disconnected');
  process.exit(0);
});

export default redisClient;
