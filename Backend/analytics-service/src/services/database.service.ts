import mongoose from 'mongoose';
import { logger } from '../utils/logger';

// MongoDB connection string
const mongoUri = process.env.MONGODB_URI || 'mongodb://mongodb:27017/soundscape-analytics';

/**
 * Database Service
 * 
 * Handles MongoDB connection and provides database utilities
 */
class DatabaseService {
  /**
   * Connect to MongoDB
   */
  async connect(): Promise<void> {
    try {
      // Set mongoose options
      mongoose.set('strictQuery', false);
      
      // Connect to MongoDB
      await mongoose.connect(mongoUri);
      
      logger.info('Connected to MongoDB');
    } catch (error) {
      logger.error('Error connecting to MongoDB:', error);
      // Exit process on connection failure in production
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      logger.info('Disconnected from MongoDB');
    } catch (error) {
      logger.error('Error disconnecting from MongoDB:', error);
    }
  }

  /**
   * Get MongoDB connection status
   */
  getStatus(): { connected: boolean; status: string } {
    const state = mongoose.connection.readyState;
    let status = 'disconnected';
    
    switch (state) {
      case 0:
        status = 'disconnected';
        break;
      case 1:
        status = 'connected';
        break;
      case 2:
        status = 'connecting';
        break;
      case 3:
        status = 'disconnecting';
        break;
      default:
        status = 'unknown';
    }
    
    return {
      connected: state === 1,
      status
    };
  }
}

// Export singleton instance
export const dbService = new DatabaseService();
