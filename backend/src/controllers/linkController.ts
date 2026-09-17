import { Response } from 'express';
import { LinkService } from '../services/linkService.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';

export const createLink = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const { originalUrl, customSlug, title, tags } = req.body;

  const shortLink = await LinkService.createLink(
    userId,
    originalUrl,
    customSlug,
    title,
    tags
  );

  res.status(201).json(new ApiResponse(201, shortLink, 'Short link created successfully'));
});

export const getLinks = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;
  const search = req.query.search as string;

  const result = await LinkService.getUserLinks(userId, page, limit, search);
  res.status(200).json(new ApiResponse(200, result, 'User links fetched successfully'));
});

export const getLinkById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const linkId = req.params.id;

  const link = await LinkService.getLinkById(userId, linkId);
  res.status(200).json(new ApiResponse(200, link, 'Short link details fetched'));
});

export const updateLink = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const linkId = req.params.id;

  const updatedLink = await LinkService.updateLink(userId, linkId, req.body);
  res.status(200).json(new ApiResponse(200, updatedLink, 'Short link updated successfully'));
});

export const deleteLink = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const linkId = req.params.id;

  const result = await LinkService.deleteLink(userId, linkId);
  res.status(200).json(new ApiResponse(200, result, 'Short link deleted successfully'));
});
