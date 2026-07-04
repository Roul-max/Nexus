import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const requiredConfig = {
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const missingConfig = Object.entries(requiredConfig)
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (missingConfig.length > 0 && process.env.NODE_ENV === 'production') {
  throw new Error(`Missing Firebase Client variables: ${missingConfig.join(', ')}`);
}

const firebaseConfig = {
  apiKey: requiredConfig.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: requiredConfig.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: requiredConfig.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: requiredConfig.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: requiredConfig.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: requiredConfig.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
