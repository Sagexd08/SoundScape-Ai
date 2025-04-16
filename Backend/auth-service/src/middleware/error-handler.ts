import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface ErrorResponse {
  error: {
    message: string;
    status: number;
    timestamp: string;
  }
}

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public name: string = 'AppError'
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error({
    error: err,
    path: req.path,
    method: req.method,
  });

  // Default error response
  let statusCode = 500;
  let message = 'Internal Server Error';

  // Handle known error types
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else {
    // Map common error types
    switch (err.name) {
      case 'ValidationError':
        statusCode = 400;
        message = 'Invalid request data';
        break;
      case 'UnauthorizedError':
        statusCode = 401;
        message = 'Authentication required';
        break;
      case 'ForbiddenError':
        statusCode = 403;
        message = 'Access denied';
        break;
      case 'NotFoundError':
        statusCode = 404;
        message = 'Resource not found';
        break;
      default:
        // Don't expose internal error details in production
        if (process.env.NODE_ENV === 'development') {
          message = err.message;
        }
    }
  }

  const errorResponse: ErrorResponse = {
    error: {
      message,
      status: statusCode,
      timestamp: new Date().toISOString()
    }
  };

  res.status(statusCode).json(errorResponse);
};
