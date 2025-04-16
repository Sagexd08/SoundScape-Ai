import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

export const supabaseAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the token using Supabase JWT secret
    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET || '');
    
    // Add the user info to the request
    req.user = decoded;
    
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Add user property to Express Request
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
