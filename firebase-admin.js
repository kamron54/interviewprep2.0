// firebase-admin.js
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

// Returns the decoded Firebase ID token from an `Authorization: Bearer <token>` header, or null.
export async function getUserFromRequest(req) {
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  if (!idToken) return null;
  try {
    return await admin.auth().verifyIdToken(idToken);
  } catch (err) {
    console.error('Invalid Firebase ID token', err);
    return null;
  }
}

export default admin;
