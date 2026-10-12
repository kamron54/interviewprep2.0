import admin from '../firebase-admin';
import { readLinkToken } from '../email.js';

// Links look like /api/unsubscribe/<token> (vercel.json passes the token on as ?t=)
export function tokenFrom(req) {
  if (req.query?.t) return String(req.query.t);
  const url = new URL(req.url || '/', 'https://x');
  return url.searchParams.get('t') || decodeURIComponent(url.pathname.split('/api/unsubscribe/')[1] || '') || null;
}

// The unsubscribe link in the survey email. GET shows a confirm button (so email scanners that
// open links don't unsubscribe anyone); POST unsubscribes, from that button or from Gmail's and
// Apple Mail's own one-click "Unsubscribe".
export default async function handler(req, res) {
  const token = tokenFrom(req);
  const uid = readLinkToken(token, 'unsubscribe');
  if (!uid) return page(res, 400, 'This link isn’t valid', 'To stop emails, reply to any of our emails or write to kam.interviewprep@gmail.com.');

  if (req.method === 'POST') {
    try {
      await admin.firestore().collection('emailSends').doc(uid)
        .set({ unsubscribedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    } catch (err) {
      console.error('Unsubscribe failed:', err);
      return page(res, 500, 'Something went wrong', 'Please try again, or write to kam.interviewprep@gmail.com.');
    }
    return page(res, 200, 'You’re unsubscribed', 'You won’t get emails like this from InterviewPrep again. Account emails, like password resets, still arrive.');
  }

  return page(res, 200, 'Unsubscribe from InterviewPrep emails?', '', `
    <form method="POST" action="/api/unsubscribe/${encodeURIComponent(token)}">
      <button type="submit">Unsubscribe</button>
    </form>`);
}

function page(res, status, title, message, extra = '') {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(status).send(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} · InterviewPrep</title>
<style>
  body { margin: 0; background: #f9fafb; font-family: -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111827; }
  main { max-width: 420px; margin: 72px auto; padding: 32px 24px; background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; text-align: center; }
  h1 { font-size: 20px; margin: 0 0 8px; } p { color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0; }
  button { margin-top: 20px; background: #111827; color: #fff; border: 0; border-radius: 6px; padding: 10px 18px; font-size: 14px; font-weight: 600; cursor: pointer; }
  a { color: #6b7280; font-size: 13px; display: inline-block; margin-top: 24px; }
</style></head>
<body><main><h1>${title}</h1>${message ? `<p>${message}</p>` : ''}${extra}<a href="/">InterviewPrep</a></main></body></html>`);
}
