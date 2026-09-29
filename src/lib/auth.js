import { getProgram, DEFAULT_PROGRAM } from '../professions/index.js';

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

const AUTH_ERROR_MESSAGES = {
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/user-not-found': 'Incorrect email or password.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/missing-password': 'Please enter your password.',
  'auth/email-already-in-use': 'An account with this email already exists. Try logging in instead.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
};

// Turns a Firebase Auth error into a message we can show users
export function friendlyAuthError(err) {
  return AUTH_ERROR_MESSAGES[err?.code] || 'Something went wrong. Please try again.';
}
