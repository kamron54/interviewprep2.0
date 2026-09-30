import Stripe from 'stripe';
import { getUserFromRequest } from '../firebase-admin';
import { PLANS } from '../src/lib/pricing.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Not signed in' });
    }

    const plan = PLANS[req.body?.plan];
    if (!plan) {
      return res.status(400).json({ error: 'Unknown plan' });
    }
    if (!plan.stripePriceId) {
      console.error(`❌ No Stripe price ID set for plan "${plan.id}" in src/lib/pricing.js`);
      return res.status(500).json({ error: 'Checkout isn’t set up for this plan yet' });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.origin}/dashboard?upgraded=1`,
      cancel_url: `${req.headers.origin}/pricing`,
      metadata: {
        firebaseUid: user.uid,
        plan: plan.id, // the webhook turns this into days of access
      },
      allow_promotion_codes: true
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('❌ Stripe session error:', err);
    return res.status(500).json({ error: 'Something went wrong creating the session' });
  }
}
