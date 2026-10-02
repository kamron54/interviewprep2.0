import { FREE_TRIAL_SESSIONS } from './pricing';

// Firestore Timestamp {seconds, nanoseconds}, ISO string, or Date → Date (or null)
export function toDate(val) {
  if (!val) return null;
  if (typeof val === 'object' && val.seconds) return new Date(val.seconds * 1000);
  if (val instanceof Date) return val;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

function addDays(date, days) {
  const d = new Date(date.getTime());
  d.setDate(d.getDate() + days);
  return d;
}

function daysLeft(end, now) {
  if (!end) return 0;
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000));
}

// Where an account stands: on trial or paid, until when, and whether it can practice.
// Shared by the student dashboard and the admin users table so the two always agree.
export function getAccessState(profile, now = new Date()) {
  const trialEnd = toDate(profile.trialExpiresAt);
  const paidAt = toDate(profile.paidAt);
  // Accounts that paid before access dates were stored got 12 months from payment
  const subscriptionEndsAt = toDate(profile.subscriptionEndsAt) || (paidAt ? addDays(paidAt, 365) : null);

  // free_trial_active | free_trial_expired | paid_active | paid_cancelled
  let userState = 'free_trial_expired';
  if (profile.hasPaid && subscriptionEndsAt) {
    userState = now <= subscriptionEndsAt ? 'paid_active' : 'paid_cancelled';
  } else if (trialEnd && now < trialEnd) {
    userState = 'free_trial_active';
  }

  const sessionsCompleted = Number.isFinite(profile.sessionsCompleted) ? profile.sessionsCompleted : 0;
  const trialSessionsLeft = Math.max(0, FREE_TRIAL_SESSIONS - sessionsCompleted);

  return {
    userState,
    trialDaysRemaining: daysLeft(trialEnd, now),
    paidDaysRemaining: subscriptionEndsAt ? daysLeft(subscriptionEndsAt, now) : null,
    sessionsCompleted,
    trialSessionsLeft,
    // Practice needs paid access, or an active trial with free sessions left
    locked: !(userState === 'paid_active' || (userState === 'free_trial_active' && trialSessionsLeft > 0)),
  };
}
