import winston from 'winston';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'analytics-service' },
  transports: [
    // Console transport for all environments
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, service, ...rest }) => {
          const restString = Object.keys(rest).length ? JSON.stringify(rest, null, 2) : '';
          return `${timestamp} [${service}] ${level}: ${message} ${restString}`;
        })
      )
    }),
    // File transport for non-development environments
    ...(process.env.NODE_ENV !== 'development'
      ? [
          new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
          new winston.transports.File({ filename: 'logs/combined.log' })
        ]
      : [])
  ]
});

// Export a stream object for Morgan middleware
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
};
