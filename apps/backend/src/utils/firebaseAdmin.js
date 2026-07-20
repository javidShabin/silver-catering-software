import { initializeApp, cert } from 'firebase-admin/app';

try {
  let serviceAccount = null;

  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')};
  }

  if (serviceAccount) {
    initializeApp({
      credential: cert(serviceAccount)
    });
    console.log('[Firebase Admin] Initialized successfully');
  } else {
    console.warn('\n======================================================');
    console.warn('[Firebase Admin] WARNING: Firebase Admin SDK credentials not configured!');
    console.warn('[Firebase Admin] Google Login will fail on the backend.');
    console.warn('[Firebase Admin] Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in your env.');
    console.warn('======================================================\n');
  }
} catch (error) {
  console.error('[Firebase Admin] Error initializing:', error.message);
}
