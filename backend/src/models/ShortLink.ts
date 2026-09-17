import mongoose, { Schema, Document } from 'mongoose';

export interface IShortLink extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  originalUrl: string;
  shortCode: string;
  customSlug?: string;
  title: string;
  isActive: boolean;
  clickCount: number;
  lastClickedAt?: Date;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ShortLinkSchema = new Schema<IShortLink>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    originalUrl: {
      type: String,
      required: [true, 'Original URL is required'],
      trim: true,
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    customSlug: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      default: 'Untitled Link',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
    lastClickedAt: {
      type: Date,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index for user link library queries
ShortLinkSchema.index({ userId: 1, createdAt: -1 });

export const ShortLink = mongoose.model<IShortLink>('ShortLink', ShortLinkSchema);
