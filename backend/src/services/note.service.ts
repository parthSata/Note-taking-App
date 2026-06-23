import bcrypt from 'bcryptjs';
import { Note } from '../models/Note';
import { ShareLink } from '../models/ShareLink';
import { generateAccessKey, generateShareToken } from '../lib/crypto';
import { env } from '../lib/env';
import { getLinkStatus } from './share.service';
import type { CreateNoteInput } from '../validations/note.schema';

const BCRYPT_ROUNDS = 12;

export async function createNoteWithShareLink(userId: string, input: CreateNoteInput) {
  const note = await Note.create({
    userId,
    title: input.title,
    content: input.content,
  });

  let accessKey: string | undefined;
  let passwordHash: string | null = null;

  if (input.accessType === 'PASSWORD') {
    accessKey = generateAccessKey();
    passwordHash = await bcrypt.hash(accessKey, BCRYPT_ROUNDS);
  }

  const shareLink = await ShareLink.create({
    noteId: note._id,
    token: generateShareToken(),
    accessType: input.accessType,
    shareType: input.shareType,
    passwordHash,
    expiresAt: new Date(input.expiresAt),
    viewCount: 0,
  });

  return {
    note: {
      id: note._id.toString(),
      title: note.title,
      content: note.content,
    },
    shareLink: {
      url: `${env.APP_URL}/share/${shareLink.token}`,
      accessType: shareLink.accessType,
      shareType: shareLink.shareType,
      expiresAt: shareLink.expiresAt.toISOString(),
      viewCount: shareLink.viewCount,
      status: getLinkStatus(shareLink),
      ...(accessKey ? { accessKey } : {}),
    },
  };
}

export async function listNotesForUser(userId: string) {
  const notes = await Note.find({ userId }).sort({ createdAt: -1 }).lean();
  if (notes.length === 0) {
    return { notes: [] };
  }

  const noteIds = notes.map((note) => note._id);
  const shareLinks = await ShareLink.find({ noteId: { $in: noteIds } }).lean();
  const linkByNoteId = new Map(shareLinks.map((link) => [link.noteId.toString(), link]));

  return {
    notes: notes.map((note) => {
      const shareLink = linkByNoteId.get(note._id.toString());
      return {
        id: note._id.toString(),
        title: note.title,
        contentPreview: note.content.slice(0, 120),
        createdAt: note.createdAt.toISOString(),
        shareLink: shareLink
          ? {
              url: `${env.APP_URL}/share/${shareLink.token}`,
              accessType: shareLink.accessType,
              shareType: shareLink.shareType,
              expiresAt: shareLink.expiresAt.toISOString(),
              viewCount: shareLink.viewCount,
              status: getLinkStatus(shareLink),
            }
          : null,
      };
    }),
  };
}

export async function getNoteForOwner(userId: string, noteId: string) {
  const note = await Note.findById(noteId);
  if (!note || note.userId.toString() !== userId) {
    throw new Error('Note not found');
  }

  const shareLink = await ShareLink.findOne({ noteId: note._id });
  if (!shareLink) {
    throw new Error('Share link not found');
  }

  return {
    note: {
      id: note._id.toString(),
      title: note.title,
      content: note.content,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    },
    shareLink: {
      url: `${env.APP_URL}/share/${shareLink.token}`,
      accessType: shareLink.accessType,
      shareType: shareLink.shareType,
      expiresAt: shareLink.expiresAt.toISOString(),
      viewCount: shareLink.viewCount,
      status: getLinkStatus(shareLink),
      lastViewedAt: shareLink.lastViewedAt?.toISOString() ?? null,
      usedAt: shareLink.usedAt?.toISOString() ?? null,
      revokedAt: shareLink.revokedAt?.toISOString() ?? null,
    },
  };
}

export async function revokeShareLink(userId: string, noteId: string) {
  const note = await Note.findById(noteId);
  if (!note || note.userId.toString() !== userId) {
    throw new Error('Note not found');
  }

  const shareLink = await ShareLink.findOneAndUpdate(
    { noteId: note._id, revokedAt: null },
    { $set: { revokedAt: new Date() } },
    { new: true },
  );

  if (!shareLink) {
    throw new Error('Share link not found or already revoked');
  }

  return {
    shareLink: {
      status: getLinkStatus(shareLink),
      revokedAt: shareLink.revokedAt?.toISOString() ?? null,
    },
  };
}
