const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
});

const app = express();
const PORT = process.env.PORT || 8000;

// Enhanced security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.CORS_ORIGIN || 'http://localhost:3000'],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "same-site" },
}));

// Stricter CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // 24 hours
}));

// Request logging middleware
app.use((req, res, next) => {
  logger.info({
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// Enhanced rate limiting
const defaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later',
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many authentication attempts, please try again later',
});

app.use('/api/', defaultLimiter);
app.use('/api/auth', authLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Documentation endpoint
app.use('/api/docs', express.static('public/docs'));

// Service Routing
app.use('/api/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || 'http://auth-service:4000',
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '' }
}));

app.use('/api/users', createProxyMiddleware({
  target: process.env.USER_SERVICE_URL || 'http://user-service:4001',
  changeOrigin: true,
  pathRewrite: { '^/api/users': '' }
}));

app.use('/api/audio', createProxyMiddleware({
  target: process.env.AUDIO_PROCESSOR_URL || 'http://audio-processor:4002',
  changeOrigin: true,
  pathRewrite: { '^/api/audio': '' },
  ws: true, // Enable WebSocket proxy for real-time audio streaming
}));

app.use('/api/storage', createProxyMiddleware({
  target: process.env.STORAGE_SERVICE_URL || 'http://storage-service:4003',
  changeOrigin: true,
  pathRewrite: { '^/api/storage': '' }
}));

app.use('/api/recommendations', createProxyMiddleware({
  target: process.env.RECOMMENDATION_ENGINE_URL || 'http://recommendation-engine:4004',
  changeOrigin: true,
  pathRewrite: { '^/api/recommendations': '' }
}));

app.use('/api/analytics', createProxyMiddleware({
  target: process.env.ANALYTICS_SERVICE_URL || 'http://analytics-service:4005',
  changeOrigin: true,
  pathRewrite: { '^/api/analytics': '' }
}));

app.use('/api/notifications', createProxyMiddleware({
  target: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:4006',
  changeOrigin: true,
  pathRewrite: { '^/api/notifications': '' }
}));

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err);
  res.status(500).json({
    error: {
      message: 'Internal Server Error',
      status: 500,
      timestamp: new Date().toISOString()
    }
  });
});

// Start the server
app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
