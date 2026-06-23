import { Hono } from 'hono';
import { setCookie, deleteCookie } from 'hono/cookie';
import { zValidator } from '@hono/zod-validator';
import { registerSchema, loginSchema } from '../validations/auth.schema';
import { registerUser, loginUser } from '../services/auth.service';
import { signToken, getAuthCookieOptions, AUTH_COOKIE } from '../lib/auth';

const authRoutes = new Hono();

const postOnly = (path: string) =>
  authRoutes.get(path, (c) =>
    c.json(
      {
        error: 'Method not allowed',
        message: `Use POST ${c.req.path}. Opening this URL in a browser sends GET.`,
        allowed: 'POST',
      },
      405,
    ),
  );

postOnly('/register');
postOnly('/login');
postOnly('/logout');

authRoutes.post('/register', zValidator('json', registerSchema), async (c) => {
  try {
    const body = c.req.valid('json');
    const user = await registerUser(body);
    const token = signToken({ userId: user.id, email: user.email });

    setCookie(c, AUTH_COOKIE, token, getAuthCookieOptions());

    return c.json({ user, token }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    const status = message === 'Email already registered' ? 409 : 400;
    return c.json({ error: message }, status);
  }
});

authRoutes.post('/login', zValidator('json', loginSchema), async (c) => {
  try {
    const body = c.req.valid('json');
    const user = await loginUser(body);
    const token = signToken({ userId: user.id, email: user.email });

    setCookie(c, AUTH_COOKIE, token, getAuthCookieOptions());

    return c.json({ user, token });
  } catch {
    return c.json({ error: 'Invalid email or password' }, 401);
  }
});

authRoutes.post('/logout', (c) => {
  deleteCookie(c, AUTH_COOKIE, { path: '/' });
  return c.json({ success: true });
});

export default authRoutes;
