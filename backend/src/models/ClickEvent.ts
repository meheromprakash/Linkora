import mongoose, { Schema, Document } from 'mongoose';

export interface IClickEvent extends Document {
  _id: mongoose.Types.ObjectId;
  linkId: mongoose.Types.ObjectId;
  shortCode: string;
  timestamp: Date;
  referrer: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'bot' | 'unknown';
  browser: string;
  os: string;
  ipHash: string;
  country?: string;
}

const ClickEventSchema = new Schema<IClickEvent>(
  {
    linkId: {
      type: Schema.Types.ObjectId,
      ref: 'ShortLink',
      required: true,
      index: true,
    },
    shortCode: {
      type: String,
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    referrer: {
      type: String,
      default: 'Direct / None',
      trim: true,
    },
    deviceType: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'bot', 'unknown'],
      default: 'unknown',
    },
    browser: {
      type: String,
      default: 'Unknown',
    },
    os: {
      type: String,
      default: 'Unknown',
    },
    ipHash: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      default: 'Unknown',
    },
  },
  {
    timestamps: false,
  }
);

// Compound indexes for time-series queries & aggregations
ClickEventSchema.index({ linkId: 1, timestamp: -1 });
ClickEventSchema.index({ shortCode: 1, timestamp: -1 });

export const ClickEvent = mongoose.model<IClickEvent>('ClickEvent', ClickEventSchema);
