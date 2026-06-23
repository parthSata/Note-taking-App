import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { authMiddleware, type AuthVariables } from '../middleware/auth';
import { createNoteSchema } from '../validations/note.schema';
import {
  createNoteWithShareLink,
  getNoteForOwner,
  listNotesForUser,
  revokeShareLink,
} from '../services/note.service';

const notesRoutes = new Hono<{ Variables: AuthVariables }>();

notesRoutes.get('/', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const result = await listNotesForUser(userId);
    return c.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to list notes';
    return c.json({ error: message }, 400);
  }
});

notesRoutes.post('/', authMiddleware, zValidator('json', createNoteSchema), async (c) => {
  try {
    const userId = c.get('userId');
    const body = c.req.valid('json');
    const result = await createNoteWithShareLink(userId, body);
    return c.json(result, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create note';
    return c.json({ error: message }, 400);
  }
});

notesRoutes.get('/:id', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const noteId = c.req.param('id');
    const result = await getNoteForOwner(userId, noteId);
    return c.json(result);
  } catch {
    return c.json({ error: 'Note not found' }, 404);
  }
});

notesRoutes.patch('/:id/revoke', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const noteId = c.req.param('id');
    const result = await revokeShareLink(userId, noteId);
    return c.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to revoke link';
    const status = message.includes('not found') ? 404 : 400;
    return c.json({ error: message }, status);
  }
});

export default notesRoutes;
