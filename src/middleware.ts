import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { applyHelmetHeaders } from '@/middleware/helmet';
import { validateCsrfToken } from '@/middleware/csrf';
import { checkRateLimit } from '@/lib/rate-limit';

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const identifier = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? request.headers.get('x-real-ip')
      ?? 'unknown';
    const result = await checkRateLimit('api', identifier, 120, '1 m');
    if (!result.success) {
      return NextResponse.json({ error: 'Too many requests' }, {
        status: 429,
        headers: {
          'Retry-After': Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)).toString(),
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.reset.toString(),
        },
      });
    }

    if (!request.nextUrl.pathname.startsWith('/api/webhooks/') && !(await validateCsrfToken(request))) {
      return NextResponse.json({ error: 'Invalid CSRF Token' }, { status: 403 });
    }
  }

  return applyHelmetHeaders(NextResponse.next());
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
