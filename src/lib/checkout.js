import { auth } from '../../firebase';

// Redirects the signed-in user to Stripe Checkout for a plan in PLANS ('month' | 'year').
// Stripe sends them back to /dashboard.
export async function startCheckout(plan) {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const token = await user.getIdToken();
  const res = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ plan }),
  });

  if (!res.ok) {
    throw new Error('Server error: ' + (await res.text()));
  }

  const { url } = await res.json();
  window.location.href = url;
}
