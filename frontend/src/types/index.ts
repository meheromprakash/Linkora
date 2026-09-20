export interface User {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  createdAt?: string;
  bioProfile?: BioProfile;
}

export interface ShortLink {
  _id: string;
  userId: string;
  originalUrl: string;
  shortCode: string;
  customSlug?: string;
  title: string;
  isActive: boolean;
  clickCount: number;
  lastClickedAt?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SummaryStats {
  totalLinks: number;
  activeLinks: number;
  totalClicks: number;
  topLink?: {
    id: string;
    title: string;
    shortCode: string;
    clickCount: number;
  } | null;
}

export interface AnalyticsData {
  timeframeDays: number;
  clicksOverTime: Array<{ date: string; clicks: number }>;
  referrers: Array<{ referrer: string; count: number }>;
  devices: Array<{ device: string; count: number }>;
  browsers: Array<{ browser: string; count: number }>;
}

export interface BioLink {
  id: string;
  title: string;
  url: string;
  icon?: string;
  shortLinkId?: string;
  isActive: boolean;
  order: number;
}

export interface BioSocials {
  twitter?: string;
  github?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
  website?: string;
}

export interface BioProfile {
  _id?: string;
  userId?: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl?: string;
  theme: 'minimal-light' | 'dark-slate' | 'gradient-neon';
  links: BioLink[];
  socials: BioSocials;
  createdAt?: string;
  updatedAt?: string;
}
