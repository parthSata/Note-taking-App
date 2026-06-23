import bcrypt from 'bcryptjs';
import { Note } from '../models/Note';
import { ShareLink, type IShareLink } from '../models/ShareLink';
import type { LinkStatus } from '../types';

export function getLinkStatus(link: Pick<IShareLink, 'revokedAt' | 'expiresAt' | 'shareType' | 'usedAt'> | null): LinkStatus {
  if (!link) return 'INVALID';
  if (link.revokedAt) return 'REVOKED';
  if (link.expiresAt < new Date()) return 'EXPIRED';
  if (link.shareType === 'ONE_TIME' && link.usedAt) return 'USED';
  return 'ACTIVE';
}

export async function getShareLinkStatus(token: string) {
  const link = await ShareLink.findOne({ token });
  const status = getLinkStatus(link);

  return {
    status,
    accessType: link?.accessType ?? 'PUBLIC',
    requiresPassword: link?.accessType === 'PASSWORD',
  };
}

async function atomicAccessUpdate(link: IShareLink) {
  const now = new Date();

  if (link.shareType === 'ONE_TIME') {
    return ShareLink.findOneAndUpdate(
      {
        token: link.token,
        shareType: 'ONE_TIME',
        usedAt: null,
        revokedAt: null,
        expiresAt: { $gt: now },
      },
      {
        $set: { usedAt: now, lastViewedAt: now },
        $inc: { viewCount: 1 },
      },
      { new: true },
    );
  }

  return ShareLink.findOneAndUpdate(
    {
      token: link.token,
      shareType: 'TIME_BASED',
      revokedAt: null,
      expiresAt: { $gt: now },
    },
    {
      $set: { lastViewedAt: now },
      $inc: { viewCount: 1 },
    },
    { new: true },
  );
}

function getAccessError(status: LinkStatus): string {
  switch (status) {
    case 'INVALID':
      return 'This share link is invalid';
    case 'REVOKED':
      return 'This share link has been revoked';
    case 'EXPIRED':
      return 'This share link has expired';
    case 'USED':
      return 'This one-time link has already been used';
    default:
      return 'Unable to access this link';
  }
}

export async function accessPublicShare(token: string) {
  const link = await ShareLink.findOne({ token });
  const status = getLinkStatus(link);

  if (status !== 'ACTIVE' || !link) {
    throw new Error(getAccessError(status));
  }

  if (link.accessType === 'PASSWORD') {
    throw new Error('Password required');
  }

  const updated = await atomicAccessUpdate(link);
  if (!updated) {
    throw new Error(getAccessError(getLinkStatus(link)));
  }

  const note = await Note.findById(updated.noteId);
  if (!note) {
    throw new Error('Note not found');
  }

  return {
    title: note.title,
    content: note.content,
    viewCount: updated.viewCount,
  };
}

export async function unlockPasswordShare(token: string, accessKey?: string) {
  const link = await ShareLink.findOne({ token });
  const status = getLinkStatus(link);

  if (status !== 'ACTIVE' || !link) {
    throw new Error(getAccessError(status));
  }

  if (link.accessType !== 'PASSWORD') {
    throw new Error('This link does not require a password');
  }

  if (!accessKey) {
    throw new Error('Access key is required');
  }

  const valid = await bcrypt.compare(accessKey, link.passwordHash ?? '');
  if (!valid) {
    throw new Error('Invalid access key');
  }

  const updated = await atomicAccessUpdate(link);
  if (!updated) {
    throw new Error(getAccessError(getLinkStatus(link)));
  }

  const note = await Note.findById(updated.noteId);
  if (!note) {
    throw new Error('Note not found');
  }

  return {
    title: note.title,
    content: note.content,
    viewCount: updated.viewCount,
  };
}
