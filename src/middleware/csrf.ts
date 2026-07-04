import type { NextRequest } from 'next/server';

const secret = process.env.CSRF_SECRET;
if (!secret && process.env.NODE_ENV === 'production') {
  throw new Error('CSRF_SECRET is required in production');
}

const encoder = new TextEncoder();

async function signingKey() {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret ?? 'development-only-csrf-secret'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
}

function encode(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...Array.from(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function generateCsrfToken() {
  const nonce = crypto.randomUUID();
  const signature = await crypto.subtle.sign('HMAC', await signingKey(), encoder.encode(nonce));
  return `${nonce}.${encode(new Uint8Array(signature))}`;
}

export async function validateCsrfToken(req: NextRequest) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return true;
  const authorization = req.headers.get('authorization');
  if (authorization?.startsWith('Bearer ')) return true;

  const headerToken = req.headers.get('x-csrf-token');
  const cookieToken = req.cookies.get('csrf-token')?.value;
  if (!headerToken || !cookieToken || headerToken !== cookieToken) return false;

  const separator = headerToken.lastIndexOf('.');
  if (separator < 1) return false;
  const nonce = headerToken.slice(0, separator);
  return headerToken === await generateTokenForNonce(nonce);
}

async function generateTokenForNonce(nonce: string) {
  const signature = await crypto.subtle.sign('HMAC', await signingKey(), encoder.encode(nonce));
  return `${nonce}.${encode(new Uint8Array(signature))}`;
}
