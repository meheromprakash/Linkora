import mongoose from 'mongoose';
import { ClickEvent } from '../models/ClickEvent.js';
import { ShortLink } from '../models/ShortLink.js';
import { LinkService } from './linkService.js';

export class AnalyticsService {
  /**
   * Summary overview stats for logged in user's dashboard
   */
  static async getSummaryStats(userId: string) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const [totalLinks, activeLinks, aggregateClicks, topLink] = await Promise.all([
      ShortLink.countDocuments({ userId: userObjectId }),
      ShortLink.countDocuments({ userId: userObjectId, isActive: true }),
      ShortLink.aggregate([
        { $match: { userId: userObjectId } },
        { $group: { _id: null, totalClicks: { $sum: '$clickCount' } } },
      ]),
      ShortLink.findOne({ userId: userObjectId }).sort({ clickCount: -1 }).exec(),
    ]);

    const totalClicks = aggregateClicks[0]?.totalClicks || 0;

    return {
      totalLinks,
      activeLinks,
      totalClicks,
      topLink: topLink
        ? {
            id: topLink._id,
            title: topLink.title,
            shortCode: topLink.shortCode,
            clickCount: topLink.clickCount,
          }
        : null,
    };
  }

  /**
   * Detailed analytics data for a specific link or all user links
   */
  static async getLinkAnalytics(userId: string, linkId?: string, days: number = 7) {
    const userObjectId = new mongoose.Types.ObjectId(userId);

    let linkFilter: any = {};
    if (linkId) {
      // Validate ownership
      await LinkService.getLinkById(userId, linkId);
      linkFilter = { linkId: new mongoose.Types.ObjectId(linkId) };
    } else {
      // Find all link IDs belonging to user
      const userLinks = await ShortLink.find({ userId: userObjectId }).select('_id');
      const linkIds = userLinks.map((l) => l._id);
      linkFilter = { linkId: { $in: linkIds } };
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const matchQuery = { ...linkFilter, timestamp: { $gte: startDate } };

    // 1. Clicks over time (Daily grouping)
    const clicksOverTime = await ClickEvent.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
          },
          clicks: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format clicks over time to ensure continuous date range
    const formattedTimeline = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const found = clicksOverTime.find((item) => item._id === dateStr);
      formattedTimeline.push({
        date: dateStr,
        clicks: found ? found.clicks : 0,
      });
    }

    // 2. Referrers Breakdown
    const referrers = await ClickEvent.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$referrer',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    // 3. Device Distribution
    const devices = await ClickEvent.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$deviceType',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 4. Browser Breakdown
    const browsers = await ClickEvent.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$browser',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    return {
      timeframeDays: days,
      clicksOverTime: formattedTimeline,
      referrers: referrers.map((r) => ({ referrer: r._id || 'Direct', count: r.count })),
      devices: devices.map((d) => ({ device: d._id, count: d.count })),
      browsers: browsers.map((b) => ({ browser: b._id, count: b.count })),
    };
  }
}
