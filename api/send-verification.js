import admin, { getUserFromRequest } from '../firebase-admin';
import { escapeHtml, firstNameOf, sendEmail, siteUrl } from '../email.js';

// Sends the "confirm your email" message ourselves through Resend instead of Firebase's built-in
// email. Firebase's wording is identical in every app that uses it, so Gmail files it as spam.
// Until RESEND_API_KEY is set this returns 503, and the site falls back to Firebase's email.

const MIN_GAP_MS = 60 * 1000;
const MAX_PER_DAY = 5;

// Short and plain on purpose: personal-looking mail is less likely to be filtered
export function verificationEmail({ firstName, link }) {
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,';
  return {
    subject: 'Confirm your email for InterviewPrep',
    text: [
      greeting,
      '',
      'Confirm your email to start practicing on InterviewPrep:',
      link,
      '',
      'If you didn’t sign up for InterviewPrep, you can ignore this email.',
      '',
      'Kamron',
      'InterviewPrep',
    ].join('\n'),
    html: `<div style="font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#111827;max-width:480px">
<p>${escapeHtml(greeting)}</p>
<p>Confirm your email to start practicing on InterviewPrep:</p>
<p><a href="${link}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:6px;font-weight:600">Confirm my email</a></p>
<p style="color:#6b7280;font-size:13px">Or paste this link into your browser:<br><a href="${link}" style="color:#6b7280">${link}</a></p>
<p>If you didn’t sign up for InterviewPrep, you can ignore this email.</p>
<p>Kamron<br>InterviewPrep</p>
</div>`,
  };
}

// POST, signed in: emails a verification link to the caller's own address
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Not signed in' });
  if (user.email_verified) return res.status(200).json({ alreadyVerified: true });
  if (!process.env.RESEND_API_KEY) return res.status(503).json({ error: 'Email sending isn’t set up' });

  try {
    // Per-account limits, kept in a server-only collection so students can't reset them
    const logRef = admin.firestore().collection('emailSends').doc(user.uid);
    const log = (await logRef.get()).data() || {};
    const now = Date.now();
    const today = new Date(now).toISOString().slice(0, 10);
    const sentToday = log.day === today ? log.count || 0 : 0;
    if (now - (log.lastSentAt || 0) < MIN_GAP_MS || sentToday >= MAX_PER_DAY) {
      return res.status(429).json({ error: 'Too many emails' });
    }

    // Firebase makes the one-time code; the link points at our own page (src/pages/VerifyEmail.jsx)
    const firebaseLink = await admin.auth().generateEmailVerificationLink(user.email);
    const oobCode = new URL(firebaseLink).searchParams.get('oobCode');
    const link = `${siteUrl()}/verify-email?oobCode=${encodeURIComponent(oobCode)}`;

    const profile = (await admin.firestore().collection('users').doc(user.uid).get()).data() || {};
    try {
      await sendEmail({ to: user.email, ...verificationEmail({ firstName: firstNameOf(profile.name), link }) });
    } catch (err) {
      console.error('Resend rejected the verification email:', err.message);
      return res.status(502).json({ error: 'Could not send the email' });
    }

    await logRef.set({ lastSentAt: now, day: today, count: sentToday + 1 });
    return res.status(200).json({ sent: true });
  } catch (err) {
    console.error('Verification email failed:', err);
    return res.status(500).json({ error: 'Could not send the email' });
  }
}
