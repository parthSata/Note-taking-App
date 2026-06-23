import { NextRequest, NextResponse } from 'next/server';
import { handle } from 'hono/vercel';
import honoApp from '@note-taking/backend';
import { AUTH_COOKIE, AUTH_COOKIE_OPTIONS } from '@/lib/auth-edge';

const REMOTE_BACKEND =
  process.env.BACKEND_URL ??
  (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : '');

async function proxyRequest(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  const targetUrl = `${REMOTE_BACKEND}${url.pathname}${url.search}`;

  const skipHeaders = new Set([
    'host',
    'connection',
    'expect',
    'transfer-encoding',
    'content-length',
    'keep-alive',
  ]);

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (skipHeaders.has(key.toLowerCase())) return;
    headers.set(key, value);
  });

  let body: string | undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    body = await request.text();
  }

  const backendResponse = await fetch(targetUrl, {
    method: request.method,
    headers,
    body,
    redirect: 'manual',
  });

  const pathname = url.pathname;

  // Set auth cookie on the Next.js origin so middleware can read it after login/register
  if (
    (pathname === '/api/auth/login' || pathname === '/api/auth/register') &&
    backendResponse.ok
  ) {
    const data = (await backendResponse.json()) as { token?: string };
    const response = NextResponse.json(data, { status: backendResponse.status });

    if (data.token) {
      response.cookies.set(AUTH_COOKIE, data.token, AUTH_COOKIE_OPTIONS);
    }

    return response;
  }

  if (pathname === '/api/auth/logout') {
    const data = await backendResponse.json().catch(() => ({ success: true }));
    const response = NextResponse.json(data, { status: backendResponse.status });
    response.cookies.delete(AUTH_COOKIE);
    return response;
  }

  const responseHeaders = new Headers();
  backendResponse.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') return;
    responseHeaders.set(key, value);
  });

  const response = new NextResponse(backendResponse.body, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers: responseHeaders,
  });

  const setCookies =
    typeof backendResponse.headers.getSetCookie === 'function'
      ? backendResponse.headers.getSetCookie()
      : [];

  for (const cookie of setCookies) {
    response.headers.append('Set-Cookie', cookie);
  }

  return response;
}

type RouteContext = { params: Promise<{ route?: string[] }> };

async function routeHandler(request: NextRequest, context: RouteContext) {
  if (REMOTE_BACKEND) {
    return proxyRequest(request);
  }

  return handle(honoApp)(request, context);
}

export const GET = routeHandler;
export const POST = routeHandler;
export const PATCH = routeHandler;
export const DELETE = routeHandler;
export const PUT = routeHandler;
