import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User, IUser } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
} from '../utils/jwt.js';

export class AuthService {
  /**
   * Register a new user and generate a simulated verification token
   */
  static async register(name: string, email: string, password: string) {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ApiError(409, 'User with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      isVerified: false,
      verificationToken: hashToken(verificationToken),
      verificationExpires,
    });

    console.log(`[Simulated Email] Verification token for ${email}: ${verificationToken}`);

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
      simulatedVerificationToken: verificationToken,
    };
  }

  /**
   * Verify email via token
   */
  static async verifyEmail(token: string) {
    const hashed = hashToken(token);
    const user = await User.findOne({
      verificationToken: hashed,
      verificationExpires: { $gt: new Date() },
    }).select('+verificationToken +verificationExpires');

    if (!user) {
      throw new ApiError(400, 'Invalid or expired verification token');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    return { message: 'Email verified successfully. You can now log in.' };
  }

  /**
   * Authenticate user, issue access + refresh tokens, and store refresh token hash
   */
  static async login(email: string, password: string) {
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+passwordHash +refreshTokenHash'
    );

    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const payload = { userId: user._id.toString(), email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    user.refreshTokenHash = hashToken(refreshToken);
    await user.save();

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token with rotation (invalidates old refresh token)
   */
  static async refreshTokens(incomingRefreshToken: string) {
    let decoded;
    try {
      decoded = verifyRefreshToken(incomingRefreshToken);
    } catch (err) {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }

    const user = await User.findById(decoded.userId).select('+refreshTokenHash');
    if (!user || !user.refreshTokenHash) {
      throw new ApiError(401, 'Access denied: Refresh token revoked or user not found');
    }

    const incomingHash = hashToken(incomingRefreshToken);
    if (incomingHash !== user.refreshTokenHash) {
      // Token reuse detected! Revoke all tokens for security
      user.refreshTokenHash = undefined;
      await user.save();
      throw new ApiError(401, 'Security alert: Refresh token reuse detected. Please log in again.');
    }

    // Rotate refresh token
    const payload = { userId: user._id.toString(), email: user.email };
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    user.refreshTokenHash = hashToken(newRefreshToken);
    await user.save();

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Logout user and revoke stored refresh token hash
   */
  static async logout(userId: string) {
    await User.findByIdAndUpdate(userId, { $unset: { refreshTokenHash: 1 } });
    return { message: 'Logged out successfully' };
  }

  /**
   * Request password reset token
   */
  static async forgotPassword(email: string) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Do not reveal email existence for security
      return { message: 'If an account exists, a password reset link has been generated.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = hashToken(resetToken);
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    console.log(`[Simulated Email] Reset token for ${email}: ${resetToken}`);

    return {
      message: 'Password reset link generated.',
      simulatedResetToken: resetToken,
    };
  }

  /**
   * Reset password using reset token
   */
  static async resetPassword(token: string, newPassword: string) {
    const hashed = hashToken(token);
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      throw new ApiError(400, 'Invalid or expired password reset token');
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshTokenHash = undefined; // Force re-login on all devices
    await user.save();

    return { message: 'Password reset successfully. You can now log in with your new password.' };
  }
}
