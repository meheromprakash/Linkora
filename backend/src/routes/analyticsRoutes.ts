import { Router } from 'express';
import { getSummaryStats, getLinkAnalytics } from '../controllers/analyticsController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/summary', getSummaryStats);
router.get('/details', getLinkAnalytics);

export default router;
