// The profession the user last browsed (set by ProfessionProvider), used for routes outside /:profession
export function lastProfessionSlug() {
  try {
    return localStorage.getItem('lastProfession') || 'dental';
  } catch {
    return 'dental';
  }
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
