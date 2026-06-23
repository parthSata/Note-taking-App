import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { unlockShareSchema } from '../validations/share.schema';
import { rateLimitMiddleware } from '../middleware/rate-limit';
import {
  getShareLinkStatus,
  accessPublicShare,
  unlockPasswordShare,
} from '../services/share.service';

const shareRoutes = new Hono();

shareRoutes.get('/:token', async (c) => {
  const token = c.req.param('token');
  const result = await getShareLinkStatus(token);
  return c.json(result);
});

shareRoutes.post(
  '/:token/unlock',
  rateLimitMiddleware,
  zValidator('json', unlockShareSchema),
  async (c) => {
    const token = c.req.param('token');
    const body = c.req.valid('json');

    try {
      const status = await getShareLinkStatus(token);

      if (status.status !== 'ACTIVE') {
        return c.json({ error: 'Link is not available' }, 403);
      }

      if (status.requiresPassword) {
        const result = await unlockPasswordShare(token, body.accessKey);
        return c.json(result);
      }

      const result = await accessPublicShare(token);
      return c.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Access denied';
      const status = message === 'Invalid access key' ? 401 : 403;
      return c.json({ error: message }, status);
    }
  },
);

export default shareRoutes;
