import { NextResponse } from 'next/server';

export function applyHelmetHeaders(response: NextResponse) {
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://www.gstatic.com https://www.googleapis.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' blob: data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https: wss: https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firebase.googleapis.com https://www.googleapis.com; " +
    "frame-src 'self' https://accounts.google.com https://*.firebaseapp.com; " +
    "frame-ancestors 'none'; " +
    "form-action 'self'; " +
    "upgrade-insecure-requests;"
  );

  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}