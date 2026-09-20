import { ShortLink, IShortLink } from '../models/ShortLink.js';
import { ClickEvent } from '../models/ClickEvent.js';
import { generateShortCode } from '../utils/shortCodeGenerator.js';
import { ApiError } from '../utils/ApiError.js';
import { parseRequestTelemetry } from '../utils/telemetryParser.js';
import mongoose from 'mongoose';

export class LinkService {
  /**
   * Create a new short link with unique short code or vanity custom slug
   */
  static async createLink(
    userId: string,
    originalUrl: string,
    customSlug?: string,
    title?: string,
    tags?: string[]
  ) {
    let finalShortCode = '';
    let isCustom = false;

    if (customSlug && customSlug.trim() !== '') {
      const formattedSlug = customSlug.trim().toLowerCase();
      // Collision protection check
      const existingSlug = await ShortLink.findOne({
        $or: [{ customSlug: formattedSlug }, { shortCode: formattedSlug }],
      });

      if (existingSlug) {
        throw new ApiError(409, `Custom slug '${formattedSlug}' is already taken. Please choose another.`);
      }

      finalShortCode = formattedSlug;
      isCustom = true;
    } else {
      // Auto generate 6-character short code with retry collision safety
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 5) {
        const candidate = generateShortCode(6);
        const existing = await ShortLink.findOne({
          $or: [{ shortCode: candidate }, { customSlug: candidate }],
        });
        if (!existing) {
          finalShortCode = candidate;
          isUnique = true;
        }
        attempts++;
      }

      if (!isUnique) {
        throw new ApiError(500, 'Failed to generate a unique short code. Please try again.');
      }
    }

    const defaultTitle = title && title.trim() !== '' ? title.trim() : new URL(originalUrl).hostname;

    const shortLink = await ShortLink.create({
      userId,
      originalUrl,
      shortCode: finalShortCode,
      customSlug: isCustom ? finalShortCode : undefined,
      title: defaultTitle,
      tags: tags || [],
      isActive: true,
    });

    return shortLink;
  }

  /**
   * List paginated links for authenticated user with search support
   */
  static async getUserLinks(
    userId: string,
    page: number = 1,
    limit: number = 10,
    search?: string
  ) {
    const query: any = { userId };

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { shortCode: searchRegex },
        { customSlug: searchRegex },
        { originalUrl: searchRegex },
      ];
    }

    const total = await ShortLink.countDocuments(query);
    const totalPages = Math.ceil(total / limit) || 1;
    const skip = (page - 1) * limit;

    const links = await ShortLink.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      links,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Get single link by ID with strict ownership validation
   */
  static async getLinkById(userId: string, linkId: string) {
    if (!mongoose.Types.ObjectId.isValid(linkId)) {
      throw new ApiError(400, 'Invalid link ID format');
    }

    const link = await ShortLink.findById(linkId);
    if (!link) {
      throw new ApiError(404, 'Short link not found');
    }

    if (link.userId.toString() !== userId) {
      throw new ApiError(403, 'Forbidden: You do not have permission to access this link');
    }

    return link;
  }

  /**
   * Update short link details
   */
  static async updateLink(
    userId: string,
    linkId: string,
    updateData: { title?: string; originalUrl?: string; isActive?: boolean; tags?: string[] }
  ) {
    const link = await LinkService.getLinkById(userId, linkId);

    if (updateData.title !== undefined) link.title = updateData.title;
    if (updateData.originalUrl !== undefined) link.originalUrl = updateData.originalUrl;
    if (updateData.isActive !== undefined) link.isActive = updateData.isActive;
    if (updateData.tags !== undefined) link.tags = updateData.tags;

    await link.save();
    return link;
  }

  /**
   * Delete short link and associated click telemetry
   */
  static async deleteLink(userId: string, linkId: string) {
    const link = await LinkService.getLinkById(userId, linkId);
    
    await ShortLink.findByIdAndDelete(link._id);
    await ClickEvent.deleteMany({ linkId: link._id });

    return { message: 'Short link deleted successfully' };
  }

  /**
   * High performance indexed lookup for redirect route
   */
  static async findLinkForRedirect(identifier: string): Promise<IShortLink | null> {
    const rawCode = identifier.trim();
    const lowerCode = rawCode.toLowerCase();
    return await ShortLink.findOne({
      $or: [{ shortCode: rawCode }, { shortCode: lowerCode }, { customSlug: lowerCode }],
    });
  }

  /**
   * Asynchronous non-blocking telemetry logger
   */
  static recordClickAsync(
    link: IShortLink,
    ip: string,
    userAgent?: string,
    referrer?: string
  ) {
    setImmediate(async () => {
      try {
        const telemetry = parseRequestTelemetry(ip, userAgent, referrer);
        
        await Promise.all([
          ClickEvent.create({
            linkId: link._id,
            shortCode: link.shortCode,
            timestamp: new Date(),
            referrer: telemetry.referrer,
            deviceType: telemetry.deviceType,
            browser: telemetry.browser,
            os: telemetry.os,
            ipHash: telemetry.ipHash,
          }),
          ShortLink.findByIdAndUpdate(link._id, {
            $inc: { clickCount: 1 },
            $set: { lastClickedAt: new Date() },
          }),
        ]);
      } catch (err) {
        console.error(`❌ Telemetry Async Error for link ${link.shortCode}:`, err);
      }
    });
  }
}
