import { Request, Response } from 'express';
import { AuthService } from '../services/authService.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';
import { User } from '../models/User.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const result = await AuthService.register(name, email, password);
  res.status(201).json(new ApiResponse(201, result, 'Registration successful. Please verify your email.'));
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;
  const result = await AuthService.verifyEmail(token);
  res.status(200).json(new ApiResponse(200, result, 'Email verified successfully'));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await AuthService.login(email, password);

  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
  res.status(200).json(
    new ApiResponse(200, { user, accessToken }, 'Login successful')
  );
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    res.status(401).json(new ApiResponse(401, null, 'Refresh token cookie missing'));
    return;
  }

  const { accessToken, refreshToken: newRefreshToken } = await AuthService.refreshTokens(refreshToken);

  res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);
  res.status(200).json(
    new ApiResponse(200, { accessToken }, 'Access token refreshed successfully')
  );
});

export const logout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.userId) {
    await AuthService.logout(req.user.userId);
  }
  res.clearCookie('refreshToken', COOKIE_OPTIONS);
  res.status(200).json(new ApiResponse(200, null, 'Logout successful'));
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await AuthService.forgotPassword(email);
  res.status(200).json(new ApiResponse(200, result, 'Password reset request processed'));
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  const result = await AuthService.resetPassword(token, newPassword);
  res.status(200).json(new ApiResponse(200, result, 'Password reset successful'));
});

export const getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) {
    res.status(444).json(new ApiResponse(404, null, 'User not found'));
    return;
  }
  res.status(200).json(new ApiResponse(200, user, 'Current user profile fetched'));
});
