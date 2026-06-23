import { z } from 'zod';

const envSchema = z.object({
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  APP_URL: z.string().url(),
});

type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

function resolveAppUrl(): string {
  const explicit = process.env.APP_URL?.trim();
  if (explicit && !/^https?:\/\/localhost(:\d+)?$/i.test(explicit)) {
    return explicit;
  }

  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProduction) {
    return vercelProduction.startsWith('http')
      ? vercelProduction
      : `https://${vercelProduction}`;
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }

  return explicit || 'http://localhost:3000';
}

export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;

  const parsed = envSchema.safeParse({
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    APP_URL: resolveAppUrl(),
  });

  if (!parsed.success) {
    throw new Error(`Invalid environment variables: ${parsed.error.message}`);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}

export const env = new Proxy({} as Env, {
  get(_target, prop: keyof Env) {
    return getEnv()[prop];
  },
});
