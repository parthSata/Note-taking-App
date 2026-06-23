import 'dotenv/config';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { Hono } from 'hono';
import type { ServerType } from '@hono/node-server';
import api from './index';

const app = new Hono();

app.use(
  '*',
  cors({
    origin: process.env.APP_URL ?? 'http://localhost:3000',
    credentials: true,
  }),
);

app.route('/', api);

app.get('/health', (c) => c.json({ ok: true, service: 'note-taking-backend' }));

const port = Number(process.env.PORT) || 3001;

const server: ServerType = serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Backend running on http://localhost:${info.port}`);
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Run "npm run stop" from project root.`);
    process.exit(1);
  }
  throw err;
});

function shutdown() {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 2000).unref();
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
