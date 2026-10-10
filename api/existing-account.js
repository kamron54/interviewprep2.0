import admin, { getUserFromRequest } from '../firebase-admin';

// Gmail ignores dots, so kamronsafarnejad@gmail.com and kamron.safarnejad@gmail.com are one inbox.
// Google reports the address as it was created, but Firebase compares exact text, so someone who
// signed up with a password under another dot pattern would get a second, empty account.
// "+" tags are kept: Google never returns them, and they're deliberately separate accounts.
export function gmailKey(email) {
  const match = /^([^@]+)@(gmail|googlemail)\.com$/i.exec(String(email || '').trim());
  return match ? `${match[1].toLowerCase().replace(/\./g, '')}@gmail.com` : null;
}

// POST, signed in: does this Gmail inbox already have an account under another address?
// Called only before a brand-new Google account gets a profile (src/lib/auth.js). Returning the
// address is safe: it's the caller's own inbox.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Not signed in' });

  const key = gmailKey(user.email);
  if (!key) return res.status(200).json({ existingEmail: null });

  try {
    // Reads every profile's email, which is fine at this size. Past a few thousand users,
    // store gmailKey on each profile and query it instead.
    const snap = await admin.firestore().collection('users').select('email').get();
    const match = snap.docs.find((d) => d.id !== user.uid && gmailKey(d.get('email')) === key);
    return res.status(200).json({ existingEmail: match ? match.get('email') : null });
  } catch (err) {
    console.error('Existing-account check failed:', err);
    return res.status(500).json({ error: 'Check failed' });
  }
}
