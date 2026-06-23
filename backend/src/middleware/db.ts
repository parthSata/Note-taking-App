import { createMiddleware } from 'hono/factory';
import { connectDB } from '../lib/db';

export const dbMiddleware = createMiddleware(async (_c, next) => {
  await connectDB();
  await next();
});
