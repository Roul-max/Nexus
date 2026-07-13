import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/server';

// This route runs in the Node.js runtime (not Edge), so firebase-admin works fine.
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  // Only allow internal calls from middleware
  const internalSecret = req.headers.get('x-internal-secret');
  if (internalSecret !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { idToken } = await req.json();
  if (!idToken) {
    return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return NextResponse.json({ uid: decodedToken.uid, email: decodedToken.email ?? '' });
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
