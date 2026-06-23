import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE, verifyToken } from '@/lib/auth-edge';

const protectedPaths = ['/notes'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE)?.value;

  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (isAuthPage && token) {
    try {
      await verifyToken(token);
      return NextResponse.redirect(new URL('/notes', request.url));
    } catch {
      // Invalid token on auth page — allow access so user can log in again
    }
  }

  if (!isProtected) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    await verifyToken(token);
    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete(AUTH_COOKIE);
    return response;
  }
}

export const config = {
  matcher: ['/notes', '/notes/:path*', '/login', '/register'],
};
