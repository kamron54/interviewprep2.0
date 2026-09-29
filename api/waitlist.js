import admin, { getUserFromRequest } from '../firebase-admin';
import { getProgram } from '../src/professions/index.js';

// POST: public "Get notified" signup for a coming-soon program.
// GET:  admin-only list of every signup, for the admin dashboard.
// Both go through firebase-admin, so no Firestore security rules are needed for `waitlist`.
export default async function handler(req, res) {
  if (req.method === 'POST') return join(req, res);
  if (req.method === 'GET') return list(req, res);
  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALREADY_EXISTS = 6; // gRPC status code

async function join(req, res) {
  const body = typeof req.body === 'string' ? safeParse(req.body) : (req.body || {});
  const email = String(body.email || '').trim().toLowerCase();
  const program = getProgram(body.program);

  if (program?.status !== 'soon') {
    return res.status(400).json({ error: 'That program isn’t taking waitlist signups.' });
  }
  if (email.length > 254 || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  try {
    // One doc per email per program, so signing up twice is harmless
    await admin.firestore()
      .collection('waitlist')
      .doc(`${program.slug}__${encodeURIComponent(email)}`)
      .create({ email, program: program.slug, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  } catch (err) {
    if (err.code !== ALREADY_EXISTS) {
      console.error('Waitlist write failed:', err);
      return res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
  }
  return res.status(200).json({ ok: true });
}

async function list(req, res) {
  const user = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Not signed in' });

  const me = await admin.firestore().collection('users').doc(user.uid).get();
  if (me.data()?.role !== 'admin') return res.status(403).json({ error: 'Admins only' });

  const snap = await admin.firestore().collection('waitlist').orderBy('createdAt', 'desc').get();
  const entries = snap.docs.map((d) => ({
    email: d.get('email'),
    program: d.get('program'),
    createdAt: d.get('createdAt')?.toDate().toISOString() ?? null,
  }));
  return res.status(200).json({ entries });
}

function safeParse(text) {
  try { return JSON.parse(text); } catch { return {}; }
}
