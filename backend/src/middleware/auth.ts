import { createMiddleware } from 'hono/factory';
import { AUTH_COOKIE, verifyToken } from '../lib/auth';

export type AuthVariables = {
  userId: string;
  email: string;
};

export const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const cookieHeader = c.req.header('cookie') ?? '';
  const tokenMatch = cookieHeader.match(new RegExp(`${AUTH_COOKIE}=([^;]+)`));
  const bearer = c.req.header('authorization')?.replace(/^Bearer\s+/i, '');
  const token = tokenMatch?.[1] ?? bearer;

  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const payload = verifyToken(token);
    c.set('userId', payload.userId);
    c.set('email', payload.email);
    await next();
  } catch {
    return c.json({ error: 'Unauthorized' }, 401);
  }
});
