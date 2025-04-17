import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Track event - requires authentication
router.post('/events', authMiddleware, analyticsController.trackEvent);

// Get user activity analytics - requires authentication
router.get('/user/:userId?', authMiddleware, analyticsController.getUserActivityAnalytics);

// Get content analytics - requires authentication
router.get('/content/:contentId', authMiddleware, analyticsController.getContentAnalytics);

// Get platform analytics - requires admin authentication
router.get('/platform', authMiddleware, analyticsController.getPlatformAnalytics);

export default router;
