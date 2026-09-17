import { Request, Response } from 'express';
import { BioService } from '../services/bioService.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';

export const getMyBioProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const profile = await BioService.getBioProfileByUserId(userId);
  res.status(200).json(new ApiResponse(200, profile, 'Bio profile fetched'));
});

export const updateMyBioProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;
  const updatedProfile = await BioService.updateBioProfile(userId, req.body);
  res.status(200).json(new ApiResponse(200, updatedProfile, 'Bio profile updated successfully'));
});

export const getPublicBioByUsername = asyncHandler(async (req: Request, res: Response) => {
  const { username } = req.params;
  const publicData = await BioService.getPublicBioByUsername(username);
  res.status(200).json(new ApiResponse(200, publicData, 'Public bio profile retrieved'));
});
