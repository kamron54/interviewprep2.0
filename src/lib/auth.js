import {
  GoogleAuthProvider, deleteUser, getAdditionalUserInfo, sendEmailVerification, signInWithPopup, signOut,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { getProgram, DEFAULT_PROGRAM } from '../professions/index.js';
import { FREE_TRIAL_DAYS } from './pricing';

const LAST_PROGRAM_KEY = 'lastProfession';

// The live program this browser last looked at, used to pre-fill signup for signed-out visitors
export function rememberedProgram() {
  try {
    const slug = localStorage.getItem(LAST_PROGRAM_KEY);
    return getProgram(slug)?.status === 'live' ? slug : DEFAULT_PROGRAM;
  } catch {
    return DEFAULT_PROGRAM;
  }
}

export function rememberProgram(slug) {
  try {
    if (getProgram(slug)?.status === 'live') localStorage.setItem(LAST_PROGRAM_KEY, slug);
  } catch { /* storage unavailable (private mode) — nothing to remember */ }
}

// Creates users/{uid} for a brand-new account; the free trial starts now
export function createProfile(user, { name, track }) {
  const trialExpiresAt = new Date();
  trialExpiresAt.setDate(trialExpiresAt.getDate() + FREE_TRIAL_DAYS);
  return setDoc(doc(db, 'users', user.uid), {
    name: name.trim(),
    email: user.email,
    track,
    createdAt: serverTimestamp(),
    trialExpiresAt: trialExpiresAt.toISOString(),
    hasPaid: false,
    promoCodeUsed: null,
    // Google has already verified its users' emails; email sign-ups verify by link
    emailVerified: user.emailVerified,
  });
}

// Sends the "confirm your email" message: ours through Resend (api/send-verification.js), or
// Firebase's built-in one when ours isn't available. Throws auth/too-many-requests when asked too often.
export async function sendVerificationEmail(user) {
  let res = null;
  try {
    res = await fetch('/api/send-verification', {
      method: 'POST',
      headers: { Authorization: `Bearer ${await user.getIdToken()}` },
    });
  } catch { /* network error: fall back below */ }
  if (res?.ok) return;
  if (res?.status === 429) throw Object.assign(new Error('Too many emails'), { code: 'auth/too-many-requests' });
  await sendEmailVerification(user);
}

// Another account already uses this Gmail inbox under a different dot pattern
// (see api/existing-account.js). Resolves to its address, or null. A failed check never blocks sign-up.
async function findExistingAccount(user) {
  if (!/@(gmail|googlemail)\.com$/i.test(user.email || '')) return null;
  try {
    const res = await fetch('/api/existing-account', {
      method: 'POST',
      headers: { Authorization: `Bearer ${await user.getIdToken()}` },
    });
    return res.ok ? (await res.json()).existingEmail || null : null;
  } catch {
    return null;
  }
}

// "Continue with Google" on the log-in and sign-up pages. A first sign-in creates the profile
// with `track`; returning accounts keep theirs. Resolves to the existing profile, or null when
// the account is new.
export async function continueWithGoogle(track) {
  const result = await signInWithPopup(auth, new GoogleAuthProvider());
  const { user } = result;
  try {
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (snap.exists()) return snap.data();

    // Same inbox, different dots (kamronsafarnejad@ vs kamron.safarnejad@): send them to their
    // real account instead of starting an empty second one
    const existingEmail = await findExistingAccount(user);
    if (existingEmail) {
      if (getAdditionalUserInfo(result)?.isNewUser) await deleteUser(user).catch(() => {});
      throw Object.assign(new Error('This Gmail inbox already has an account'), { existingEmail });
    }

    await createProfile(user, { name: user.displayName || '', track });
    rememberProgram(track);
    return null;
  } catch (err) {
    // The dashboard can't load without a profile, so don't stay half signed in; trying again redoes this
    await signOut(auth).catch(() => {});
    throw err;
  }
}

// The student closed the Google window (or clicked twice): no error worth showing
export const isGoogleCancel = (err) =>
  err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request';

const AUTH_ERROR_MESSAGES = {
  'auth/invalid-credential': 'Incorrect email or password. If you signed up with Google, use “Continue with Google”.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/user-not-found': 'Incorrect email or password.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/missing-password': 'Please enter your password.',
  'auth/email-already-in-use': 'An account with this email already exists. Try logging in instead.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  // Google sign-in
  'auth/popup-blocked': 'Your browser blocked the Google window. Allow pop-ups for this site and try again.',
  'auth/account-exists-with-different-credential': 'This email already has an account. Log in with your email and password instead.',
  'auth/operation-not-supported-in-this-environment': 'Google sign-in doesn’t work in this browser. Open the page in Safari or Chrome, or use your email.',
  'auth/web-storage-unsupported': 'Google sign-in doesn’t work in this browser. Open the page in Safari or Chrome, or use your email.',
  // Setup problems, shown only until Google sign-in is configured in Firebase
  'auth/operation-not-allowed': 'Google sign-in isn’t turned on yet. Please use your email for now.',
  'auth/unauthorized-domain': 'Google sign-in isn’t set up for this web address yet. Please use your email for now.',
};

// Turns a Firebase Auth error into a message we can show users
export function friendlyAuthError(err) {
  if (err?.existingEmail) {
    return `You already have an account as ${err.existingEmail}. Log in with that email and your password.`;
  }
  return AUTH_ERROR_MESSAGES[err?.code] || 'Something went wrong. Please try again.';
}
