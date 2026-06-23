import { createMiddleware } from 'hono/factory';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 5;

function getKey(ip: string, token: string) {
  return `${ip}:${token}`;
}

export const rateLimitMiddleware = createMiddleware(async (c, next) => {
  const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const token = c.req.param('token') ?? 'unknown';
  const key = getKey(ip, token);
  const now = Date.now();

  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    await next();
    return;
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return c.json({ error: 'Too many attempts. Please try again later.' }, 429);
  }

  entry.count += 1;
  store.set(key, entry);
  await next();
});
