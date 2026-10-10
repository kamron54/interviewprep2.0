// email.js
// Shared by the api/ routes that send email. It lives outside api/ because every file there becomes a URL.
import crypto from 'node:crypto';

export const FROM = 'InterviewPrep <hello@interviewprep.center>';
export const FROM_KAMRON = 'Kamron from InterviewPrep <kamron@interviewprep.center>';
export const REPLY_TO = 'kam.interviewprep@gmail.com'; // the contact address shown on the site

// US anti-spam law (CAN-SPAM) requires a postal address in promotional email; a P.O. box is fine.
// The survey emails don't go out while this is empty.
export const MAILING_ADDRESS = '';

// Where links open: the live site, or this preview while a branch is being tested
export function siteUrl(env = process.env) {
  const previewHost = env.VERCEL_ENV === 'preview' && (env.VERCEL_BRANCH_URL || env.VERCEL_URL);
  return previewHost ? `https://${previewHost}` : 'https://interviewprep.center';
}

export const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const firstNameOf = (name) => String(name || '').trim().split(/\s+/)[0];

async function resend(path, body, extraHeaders = {}) {
  const res = await fetch(`https://api.resend.com${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json', ...extraHeaders },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw Object.assign(new Error(`Resend ${res.status}: ${await res.text()}`), { status: res.status });
  return res.json();
}

const toResend = ({ from = FROM, to, subject, text, html, headers }) => ({
  from, to: [to], reply_to: REPLY_TO, subject, text, html, ...(headers && { headers }),
});

// One email through Resend. Throws (with .status) if Resend refuses it.
export const sendEmail = (email) => resend('/emails', toResend(email));

// Up to 100 emails in one request. `key` stops the same batch from going out twice.
export const sendEmailBatch = (emails, key) =>
  resend('/emails/batch', emails.map(toResend), key ? { 'Idempotency-Key': key } : {});

// Signed links that work without logging in (survey, unsubscribe). Each one is tied to one account
// and one purpose, so a survey link can't unsubscribe anyone, and nobody can forge a link.
export function linkToken(uid, purpose, secret = process.env.EMAIL_LINK_SECRET) {
  if (!secret) throw new Error('EMAIL_LINK_SECRET is not set');
  const sig = crypto.createHmac('sha256', secret).update(`${purpose}:${uid}`).digest('base64url');
  return `${Buffer.from(uid).toString('base64url')}.${sig}`;
}

// The account a link token belongs to, or null if it's missing, forged, or for another purpose
export function readLinkToken(token, purpose, secret = process.env.EMAIL_LINK_SECRET) {
  if (!secret || typeof token !== 'string') return null;
  const [encoded, sig] = token.split('.');
  if (!encoded || !sig) return null;
  const uid = Buffer.from(encoded, 'base64url').toString();
  const expected = Buffer.from(linkToken(uid, purpose, secret).split('.')[1]);
  const given = Buffer.from(sig);
  return given.length === expected.length && crypto.timingSafeEqual(given, expected) ? uid : null;
}
