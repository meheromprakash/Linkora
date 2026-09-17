import mongoose, { Schema, Document } from 'mongoose';

export interface IBioLink {
  id: string;
  title: string;
  url: string;
  icon?: string;
  shortLinkId?: mongoose.Types.ObjectId;
  isActive: boolean;
  order: number;
}

export interface IBioSocials {
  twitter?: string;
  github?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
  website?: string;
}

export interface IBioProfile extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl?: string;
  theme: 'minimal-light' | 'dark-slate' | 'gradient-neon';
  links: IBioLink[];
  socials: IBioSocials;
  createdAt: Date;
  updatedAt: Date;
}

const BioLinkSchema = new Schema<IBioLink>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    icon: { type: String, trim: true },
    shortLinkId: { type: Schema.Types.ObjectId, ref: 'ShortLink' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const BioSocialsSchema = new Schema<IBioSocials>(
  {
    twitter: { type: String, trim: true },
    github: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    instagram: { type: String, trim: true },
    youtube: { type: String, trim: true },
    website: { type: String, trim: true },
  },
  { _id: false }
);

const BioProfileSchema = new Schema<IBioProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    bio: {
      type: String,
      default: '',
      maxlength: 250,
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    theme: {
      type: String,
      enum: ['minimal-light', 'dark-slate', 'gradient-neon'],
      default: 'gradient-neon',
    },
    links: [BioLinkSchema],
    socials: {
      type: BioSocialsSchema,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export const BioProfile = mongoose.model<IBioProfile>('BioProfile', BioProfileSchema);
