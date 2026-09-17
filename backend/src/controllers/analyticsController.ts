import { Response } from 'express';
import { AnalyticsService } from '../services/analyticsService.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';

export const getSummaryStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const stats = await AnalyticsService.getSummaryStats(userId);
  res.status(200).json(new ApiResponse(200, stats, 'Summary statistics fetched'));
});

export const getLinkAnalytics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const linkId = req.query.linkId as string;
  const days = parseInt(req.query.days as string, 10) || 7;

  const analytics = await AnalyticsService.getLinkAnalytics(userId, linkId, days);
  res.status(200).json(new ApiResponse(200, analytics, 'Analytics data fetched'));
});
