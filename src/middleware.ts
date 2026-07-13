import { NextRequest, NextResponse } from 'next/server';
import { applyHelmetHeaders } from '@/middleware/helmet';
import { validateCsrfToken } from '@/middleware/csrf';
import { checkRateLimit } from '@/lib/rate-limit';

async function verifyFirebaseToken(
  req: NextRequest,
  idToken: string,
): Promise<{ uid: string; email: string } | null> {
  try {
    const verifyUrl = new URL('/api/v1/auth/verify-token', req.url);
    const res = await fetch(verifyUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': process.env.INTERNAL_API_SECRET ?? '',
      },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApiRoute = pathname.startsWith('/api/');
  const isHealthCheck = pathname === '/api/v1/health';
  const isStripeWebhook = pathname.startsWith('/api/webhooks/stripe');

  // Apply rate limiting to all API routes
  if (isApiRoute) {
    const result = await checkRateLimit(req);
    if (!result.success) {
      return NextResponse.json({ error: 'Too many requests' }, {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.reset.toString(),
        },
      });
    }
  }

  const headers = new Headers(req.headers);

  // Apply CSRF protection to all API routes except webhooks
  if (isApiRoute && !isStripeWebhook && !(await validateCsrfToken(req))) {
    return NextResponse.json({ error: 'Invalid CSRF Token' }, { status: 403 });
  }

  // Authentication logic
  const idToken = req.headers.get('authorization')?.split('Bearer ')[1];
  if (idToken) {
    const decoded = await verifyFirebaseToken(req, idToken);
    if (decoded) {
      headers.set('x-user-id', decoded.uid);
      headers.set('x-user-email', decoded.email);
    }
    // Silently ignore invalid/expired tokens — the route handler or redirect will handle it.
  }

  // Public routes that do not require authentication
  const publicRoutes = [
    '/login',
    '/register',
    '/forgot-password',
    '/api/v1/auth/register', // Allow registration
    '/api/v1/health', // Health check should be public
    '/api/webhooks/stripe', // Stripe webhooks have their own auth
  ];

  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return applyHelmetHeaders(NextResponse.next({ request: { headers } }));
  }

  // If no user ID header, and not a public route, redirect to login or return 401
  if (!headers.has('x-user-id')) {
    if (isApiRoute) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For authenticated users, apply remaining security headers and proceed
  return applyHelmetHeaders(NextResponse.next({
    request: {
      headers,
    },
  }));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

