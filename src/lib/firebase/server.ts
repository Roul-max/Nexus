import 'server-only';

import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

const missing = [
  !projectId && 'FIREBASE_PROJECT_ID',
  !clientEmail && 'FIREBASE_CLIENT_EMAIL',
  !privateKey && 'FIREBASE_PRIVATE_KEY',
].filter(Boolean) as string[];

function unavailable<T extends object>(service: string): T {
  return new Proxy({} as T, {
    get() {
      throw new Error(
        `${service} is unavailable. Missing Firebase Admin variables: ${missing.join(', ')}`,
      );
    },
  });
}

if (missing.length > 0 && process.env.NODE_ENV === 'production') {
  throw new Error(`Missing Firebase Admin variables: ${missing.join(', ')}`);
}

const app = missing.length === 0
  ? (getApps()[0] ?? initializeApp({
      credential: cert({ projectId: projectId!, clientEmail: clientEmail!, privateKey: privateKey! }),
      projectId,
    }))
  : null;

export const adminAuth: Auth = app ? getAuth(app) : unavailable<Auth>('Firebase Admin Auth');
export const adminDb: Firestore = app ? getFirestore(app) : unavailable<Firestore>('Firestore');
