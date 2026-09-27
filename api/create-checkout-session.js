import Stripe from 'stripe';
import { getUserFromRequest } from '../firebase-admin';

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

    // Send the user back to the dashboard for the program they were on
    const { profession } = req.body || {};
    const slug = /^[a-z]+$/.test(profession || '') ? profession : 'dental';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1S72rhHtr4snLcWRsDlqyXOn', 
          quantity: 1,
        },
      ],
      success_url: `${req.headers.origin}/${slug}/dashboard?upgraded=1`,
      cancel_url: `${req.headers.origin}/${slug}/dashboard`,
      metadata: {
        firebaseUid: user.uid,
      },
      allow_promotion_codes: true
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('❌ Stripe session error:', err);
    return res.status(500).json({ error: 'Something went wrong creating the session' });
  }
}
