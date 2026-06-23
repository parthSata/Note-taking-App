import { Hono } from 'hono';
import { dbMiddleware } from './middleware/db';
import { getEnv } from './lib/env';
import authRoutes from './routes/auth';
import notesRoutes from './routes/notes';
import shareRoutes from './routes/share';

const app = new Hono().basePath('/api');

app.get('/health', (c) => {
  try {
    getEnv();
    return c.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid environment';
    return c.json({ ok: false, error: message }, 503);
  }
});

app.get('/', (c) =>
  c.json({
    name: 'Note Taking API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
      },
      notes: {
        list: 'GET /api/notes',
        create: 'POST /api/notes',
        detail: 'GET /api/notes/:id',
        revoke: 'PATCH /api/notes/:id/revoke',
      },
      share: {
        status: 'GET /api/share/:token',
        unlock: 'POST /api/share/:token/unlock',
      },
    },
    note: 'Auth and data endpoints require POST/PATCH — opening them in a browser (GET) will not work.',
  }),
);

app.use('*', dbMiddleware);

app.onError((err, c) => {
  console.error(err);

  const message = err instanceof Error ? err.message : 'Internal server error';

  if (message.includes('environment variables') || message.includes('Invalid environment')) {
    return c.json({ error: 'Server configuration error', details: message }, 503);
  }

  return c.json({ error: 'Internal server error' }, 500);
});

app.route('/auth', authRoutes);
app.route('/notes', notesRoutes);
app.route('/share', shareRoutes);

export default app;
