import crypto from 'node:crypto';
import admin, { getUserFromRequest } from '../firebase-admin';
import {
  FROM_KAMRON, MAILING_ADDRESS, escapeHtml, firstNameOf, linkToken, sendEmail, sendEmailBatch, siteUrl,
} from '../email.js';
import { toDate } from '../src/lib/access.js';
import { SURVEY_DISCOUNT } from '../src/lib/pricing.js';

// The survey email: once, a week after a free trial ends, to verified students who never paid.
//   Vercel cron (daily, vercel.json): sends the next batch, but only when sending is switched on.
//   Admin GET: whether sending is on, how many have gone out, who's next, and the answers so far.
//   Admin POST: sends the email to the admin's own address, as a test.

const DAYS_AFTER_TRIAL = 7;
const PER_RUN = 50; // builds the new address's reputation slowly; Resend's free plan allows 100 a day

// Everything that has to be in place before real students get it
export function missingForLive(env = process.env, address = MAILING_ADDRESS) {
  return [
    env.SURVEY_EMAILS !== 'live' && 'SURVEY_EMAILS=live in Vercel',
    !address && 'a mailing address in email.js',
    !env.EMAIL_LINK_SECRET && 'EMAIL_LINK_SECRET in Vercel',
    !env.CRON_SECRET && 'CRON_SECRET in Vercel', // without it the daily job can't prove it's Vercel's
    !env.RESEND_API_KEY && 'RESEND_API_KEY in Vercel',
  ].filter(Boolean);
}

// Whether this account should get the email now. `sends` is its emailSends doc.
export function isDue(user, sends, answered, now = Date.now()) {
  if (user.role === 'admin' || user.hasPaid || answered) return false;
  if (!user.emailVerified || !user.email || user.email.includes('+')) return false; // + = test account
  if (sends?.surveySentAt || sends?.unsubscribedAt) return false;
  const trialEnd = toDate(user.trialExpiresAt);
  return !!trialEnd && now - trialEnd.getTime() >= DAYS_AFTER_TRIAL * 86400000;
}

async function loadAccounts() {
  const db = admin.firestore();
  const [users, sends, responses] = await Promise.all([
    db.collection('users').get(),
    db.collection('emailSends').get(),
    db.collection('surveyResponses').get(),
  ]);
  return {
    users: users.docs.map((d) => ({ uid: d.id, ...d.data() })),
    sends: new Map(sends.docs.map((d) => [d.id, d.data()])),
    answered: new Set(responses.docs.map((d) => d.id)),
    responses: responses.docs.map((d) => d.data()),
  };
}

// Who's due, most recent trials first (they're likeliest to still be interviewing)
export function dueAccounts({ users, sends, answered }, now = Date.now()) {
  return users
    .filter((u) => isDue(u, sends.get(u.uid), answered.has(u.uid), now))
    .sort((a, b) => toDate(b.trialExpiresAt) - toDate(a.trialExpiresAt));
}

export function surveyEmail({ firstName, surveyLink, unsubscribeLink, address = MAILING_ADDRESS }) {
  const greeting = firstName ? `Hi ${firstName},` : 'Hi,';
  const footerAddress = address || '(mailing address goes here)';
  return {
    from: FROM_KAMRON,
    subject: 'Quick question about InterviewPrep',
    text: [
      greeting,
      '',
      'I’m Kamron, the dental student who built InterviewPrep. You signed up a little while ago, and I’d love to know how it could be more useful.',
      '',
      `Would you answer a few quick questions? It takes about a minute, and as a thank-you you’ll get $${SURVEY_DISCOUNT} off 12 months of access.`,
      '',
      surveyLink,
      '',
      'Thanks,',
      'Kamron',
      '',
      '—',
      `Don’t want emails like this? Unsubscribe: ${unsubscribeLink}`,
      `InterviewPrep · ${footerAddress}`,
    ].join('\n'),
    html: `<div style="font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#111827;max-width:520px">
<p>${escapeHtml(greeting)}</p>
<p>I’m Kamron, the dental student who built InterviewPrep. You signed up a little while ago, and I’d love to know how it could be more useful.</p>
<p>Would you answer a few quick questions? It takes about a minute, and as a thank-you you’ll get $${SURVEY_DISCOUNT} off 12 months of access.</p>
<p><a href="${surveyLink}">Answer the survey</a></p>
<p>Thanks,<br>Kamron</p>
<p style="margin-top:32px;color:#6b7280;font-size:12px">Don’t want emails like this? <a href="${unsubscribeLink}" style="color:#6b7280">Unsubscribe</a>.<br>InterviewPrep · ${escapeHtml(footerAddress)}</p>
</div>`,
  };
}

// The email for one account, with its own survey and unsubscribe links
function emailFor(user) {
  const site = siteUrl();
  const unsubscribeLink = `${site}/api/unsubscribe/${linkToken(user.uid, 'unsubscribe')}`;
  return {
    to: user.email,
    ...surveyEmail({
      firstName: firstNameOf(user.name),
      surveyLink: `${site}/survey?t=${linkToken(user.uid, 'survey')}`,
      unsubscribeLink,
    }),
    // Gmail and Apple Mail show their own one-click "Unsubscribe" button from these
    headers: { 'List-Unsubscribe': `<${unsubscribeLink}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
  };
}

async function isAdmin(req) {
  const user = await getUserFromRequest(req);
  if (!user) return null;
  const me = await admin.firestore().collection('users').doc(user.uid).get();
  return me.data()?.role === 'admin' ? { uid: user.uid, ...me.data() } : null;
}

export default async function handler(req, res) {
  try {
    // Vercel's cron sends `Authorization: Bearer <CRON_SECRET>`
    const fromCron = !!process.env.CRON_SECRET && req.headers.authorization === `Bearer ${process.env.CRON_SECRET}`;
    if (fromCron) return await runDailySend(res);

    const me = await isAdmin(req);
    if (!me) return res.status(403).json({ error: 'Admins only' });

    if (req.method === 'POST') {
      if (!process.env.RESEND_API_KEY || !process.env.EMAIL_LINK_SECRET) {
        return res.status(503).json({ error: 'Add RESEND_API_KEY and EMAIL_LINK_SECRET in Vercel first.' });
      }
      await sendEmail(emailFor(me));
      return res.status(200).json({ sentTo: me.email });
    }

    const accounts = await loadAccounts();
    const due = dueAccounts(accounts);
    return res.status(200).json({
      live: missingForLive().length === 0,
      missing: missingForLive(),
      sentCount: [...accounts.sends.values()].filter((s) => s.surveySentAt).length,
      unsubscribedCount: [...accounts.sends.values()].filter((s) => s.unsubscribedAt).length,
      dueCount: due.length,
      nextBatch: due.slice(0, PER_RUN).map((u) => ({
        name: u.name || '', email: u.email, trialEndedAt: toDate(u.trialExpiresAt)?.toISOString() ?? null,
      })),
      perRun: PER_RUN,
      responses: accounts.responses
        .map((r) => ({
          submittedAt: toDate(r.submittedAt)?.toISOString() ?? null,
          email: r.email, program: r.program, sessionsCompleted: r.sessionsCompleted, via: r.via,
          reasons: r.reasons || [], other: r.other || '', prices: r.prices || {},
        }))
        .sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || '')),
    });
  } catch (err) {
    console.error('Survey emails failed:', err);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
}

async function runDailySend(res) {
  const missing = missingForLive();
  if (missing.length) return res.status(200).json({ sent: 0, dryRun: true, missing });

  const batch = dueAccounts(await loadAccounts()).slice(0, PER_RUN);
  if (!batch.length) return res.status(200).json({ sent: 0 });

  // The same recipients can't be emailed twice, even if the job runs twice in a day
  const key = `survey-${crypto.createHash('sha256').update(batch.map((u) => u.uid).join(',')).digest('hex').slice(0, 32)}`;
  await sendEmailBatch(batch.map(emailFor), key);

  const db = admin.firestore();
  const sentAt = admin.firestore.FieldValue.serverTimestamp();
  const write = db.batch();
  for (const u of batch) write.set(db.collection('emailSends').doc(u.uid), { surveySentAt: sentAt }, { merge: true });
  await write.commit();
  return res.status(200).json({ sent: batch.length });
}
