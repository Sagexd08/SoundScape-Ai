import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Record start time
  const start = Date.now();
  
  // Log request
  logger.info({
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent')
  }, 'Incoming request');

  // Process the request
  res.on('finish', () => {
    // Calculate duration
    const duration = Date.now() - start;
    
    // Log response
    logger.info({
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    }, 'Request completed');
  });

  next();
};
