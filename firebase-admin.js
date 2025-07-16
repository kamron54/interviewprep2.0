// firebase-admin.js
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  try {
    console.log('🔑 FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
    console.log('📧 FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL);
    console.log('🔒 FIREBASE_PRIVATE_KEY (first 20 chars):', process.env.FIREBASE_PRIVATE_KEY?.slice(0,20));

    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    console.log('✅ Firebase Admin initialized');
  } catch (e) {
    console.error('❌ Firebase Admin init error:', e);
    throw e;
  }
}

export const dbAdmin = getFirestore();
