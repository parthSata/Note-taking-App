import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';
import type { AccessType, ShareType } from '../types';

export interface IShareLink extends Document {
  noteId: Types.ObjectId;
  token: string;
  accessType: AccessType;
  shareType: ShareType;
  passwordHash: string | null;
  expiresAt: Date;
  viewCount: number;
  usedAt: Date | null;
  revokedAt: Date | null;
  lastViewedAt: Date | null;
  createdAt: Date;
}

const ShareLinkSchema = new Schema<IShareLink>(
  {
    noteId: { type: Schema.Types.ObjectId, ref: 'Note', required: true, index: true },
    token: { type: String, required: true, unique: true, index: true },
    accessType: { type: String, enum: ['PUBLIC', 'PASSWORD'], required: true },
    shareType: { type: String, enum: ['ONE_TIME', 'TIME_BASED'], required: true },
    passwordHash: { type: String, default: null },
    expiresAt: { type: Date, required: true, index: true },
    viewCount: { type: Number, default: 0 },
    usedAt: { type: Date, default: null },
    revokedAt: { type: Date, default: null },
    lastViewedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);


ShareLinkSchema.index({ token: 1, usedAt: 1, revokedAt: 1, expiresAt: 1 });

export const ShareLink: Model<IShareLink> =
  mongoose.models.ShareLink ?? mongoose.model<IShareLink>('ShareLink', ShareLinkSchema);
