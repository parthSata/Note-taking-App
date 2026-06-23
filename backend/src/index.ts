import { Hono } from 'hono';
import { dbMiddleware } from './middleware/db';
import authRoutes from './routes/auth';
import notesRoutes from './routes/notes';
import shareRoutes from './routes/share';

const app = new Hono().basePath('/api');

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
  return c.json({ error: 'Internal server error' }, 500);
});

app.route('/auth', authRoutes);
app.route('/notes', notesRoutes);
app.route('/share', shareRoutes);

export default app;
