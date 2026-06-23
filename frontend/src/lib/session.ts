import { cookies } from 'next/headers';
import { AUTH_COOKIE, verifyToken } from '@/lib/auth-edge';

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return null;

  try {
    const payload = await verifyToken(token);
    return payload.userId;
  } catch {
    return null;
  }
}
