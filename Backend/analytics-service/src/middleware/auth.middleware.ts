import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        role?: string;
      };
    }
  }
}

/**
 * Authentication middleware
 * 
 * Verifies JWT token from Authorization header
 * In a real implementation, this would validate the token with Supabase or another auth provider
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // For development/testing, allow anonymous access with a mock user
      if (process.env.NODE_ENV === 'development' && process.env.ALLOW_ANONYMOUS === 'true') {
        req.user = {
          id: 'anonymous-user',
          role: 'user'
        };
        return next();
      }
      
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // In a real implementation, verify the token with Supabase or another auth provider
    // For now, we'll use a simple mock implementation
    if (token === 'admin-token') {
      req.user = {
        id: 'admin-user',
        email: 'admin@example.com',
        role: 'admin'
      };
    } else {
      req.user = {
        id: 'mock-user',
        email: 'user@example.com',
        role: 'user'
      };
    }
    
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({ message: 'Invalid authentication token' });
  }
};
