import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import { logger } from './utils/logger';
import { dbService } from './services/database.service';
import { kafkaService } from './services/kafka.service';
import { cacheManager } from './services/cache.service';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const port = process.env.PORT || 5002;

// Middleware
app.use(cors());
app.use(json());

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = dbService.getStatus();
  
  res.status(200).json({
    status: 'ok',
    service: 'analytics-service',
    timestamp: new Date().toISOString(),
    database: dbStatus
  });
});

// Import routes
import analyticsRoutes from './routes/analytics.routes';

// Register routes
app.use('/api/analytics', analyticsRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await dbService.connect();
    
    // Start HTTP server
    app.listen(port, () => {
      logger.info(`Analytics service running on port ${port}`);
    });
    
    // Handle graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully');
      await kafkaService.disconnect();
      await dbService.disconnect();
      process.exit(0);
    });
    
    process.on('SIGINT', async () => {
      logger.info('SIGINT received, shutting down gracefully');
      await kafkaService.disconnect();
      await dbService.disconnect();
      process.exit(0);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
