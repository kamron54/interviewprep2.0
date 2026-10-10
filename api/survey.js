import admin, { getUserFromRequest } from '../firebase-admin';
import { firstNameOf, readLinkToken } from '../email.js';
import { cleanSurvey } from '../src/lib/survey.js';

const ALREADY_EXISTS = 6; // gRPC status code

// GET: who's answering and whether they already have. POST: save the answers.
// Answering puts the $10 thank-you on the account; api/create-checkout-session.js applies it.
export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // The signed link from the survey email works without logging in; otherwise use the login
  const fromEmail = readLinkToken(req.headers['x-survey-token'], 'survey');
  const uid = fromEmail || (await getUserFromRequest(req))?.uid;
  if (!uid) return res.status(401).json({ error: 'This link isn’t valid. Log in to take the survey.' });

  const db = admin.firestore();
  const userRef = db.collection('users').doc(uid);
  // Server-only: the checkout trusts this, not anything a student can write
  const responseRef = db.collection('surveyResponses').doc(uid);

  try {
    const [userSnap, responseSnap] = await Promise.all([userRef.get(), responseRef.get()]);
    if (!userSnap.exists) return res.status(404).json({ error: 'We couldn’t find your account.' });
    const profile = userSnap.data();

    if (req.method === 'GET' || responseSnap.exists) {
      return res.status(200).json({ firstName: firstNameOf(profile.name), alreadyAnswered: responseSnap.exists });
    }

    const body = typeof req.body === 'string' ? safeParse(req.body) : (req.body || {});
    const { answers, error } = cleanSurvey(body);
    if (error) return res.status(400).json({ error });

    await responseRef.create({
      ...answers,
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
      via: fromEmail ? 'email' : 'site',
      // Context for reading the answers later
      email: profile.email || null,
      program: profile.track || null,
      sessionsCompleted: profile.sessionsCompleted || 0,
      signedUpAt: profile.createdAt || null,
      hadPaid: !!profile.hasPaid,
    });
    // Display only (the pricing page shows the discounted price); students can write this field
    await userRef.set({ surveyDiscount: true }, { merge: true });
    return res.status(200).json({ saved: true });
  } catch (err) {
    if (err.code === ALREADY_EXISTS) return res.status(200).json({ alreadyAnswered: true }); // double submit
    console.error('Survey failed:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

function safeParse(text) {
  try { return JSON.parse(text); } catch { return {}; }
}
