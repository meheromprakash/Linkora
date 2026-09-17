import { BioProfile, IBioProfile } from '../models/BioProfile.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

export class BioService {
  /**
   * Get or create bio profile for user
   */
  static async getBioProfileByUserId(userId: string): Promise<IBioProfile> {
    let profile = await BioProfile.findOne({ userId });

    if (!profile) {
      const user = await User.findById(userId);
      if (!user) throw new ApiError(404, 'User not found');

      // Auto-generate unique username slug from email or name
      const baseUsername = user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      let username = baseUsername;
      let counter = 1;

      while (await BioProfile.findOne({ username })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      profile = await BioProfile.create({
        userId: user._id,
        username,
        displayName: user.name,
        bio: 'Welcome to my Linkora bio page!',
        theme: 'gradient-neon',
        links: [],
        socials: {},
      });
    }

    return profile;
  }

  /**
   * Update bio profile settings with username collision check
   */
  static async updateBioProfile(userId: string, updateData: Partial<IBioProfile>): Promise<IBioProfile> {
    const profile = await BioService.getBioProfileByUserId(userId);

    if (updateData.username && updateData.username.toLowerCase() !== profile.username) {
      const targetUsername = updateData.username.toLowerCase().trim();
      const existing = await BioProfile.findOne({ username: targetUsername });
      if (existing) {
        throw new ApiError(409, `Username '${targetUsername}' is already taken.`);
      }
      profile.username = targetUsername;
    }

    if (updateData.displayName !== undefined) profile.displayName = updateData.displayName;
    if (updateData.bio !== undefined) profile.bio = updateData.bio;
    if (updateData.avatarUrl !== undefined) profile.avatarUrl = updateData.avatarUrl;
    if (updateData.theme !== undefined) profile.theme = updateData.theme;
    if (updateData.links !== undefined) profile.links = updateData.links;
    if (updateData.socials !== undefined) profile.socials = updateData.socials;

    await profile.save();
    return profile;
  }

  /**
   * Get public bio profile by username
   */
  static async getPublicBioByUsername(username: string) {
    const cleanUsername = username.toLowerCase().trim();
    const profile = await BioProfile.findOne({ username: cleanUsername });

    if (!profile) {
      throw new ApiError(404, `Bio page /bio/${cleanUsername} was not found.`);
    }

    return {
      username: profile.username,
      displayName: profile.displayName,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      theme: profile.theme,
      links: profile.links.filter((l) => l.isActive).sort((a, b) => a.order - b.order),
      socials: profile.socials,
    };
  }
}
