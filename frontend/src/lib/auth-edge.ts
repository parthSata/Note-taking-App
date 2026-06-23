import { jwtVerify } from 'jose';

export const AUTH_COOKIE = 'auth_token';

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7,
};

export interface JwtPayload {
  userId: string;
  email: string;
}

export async function verifyToken(token: string): Promise<JwtPayload> {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));

  return {
    userId: String(payload.userId),
    email: String(payload.email),
  };
}
