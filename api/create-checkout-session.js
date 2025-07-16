import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({ error: 'Missing user UID' });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1RlNb5HJuEuytDk1mwf1e1hh', // your actual Price ID
          quantity: 1,
        },
      ],
      success_url: `${req.headers.origin}/dashboard`,
      cancel_url: `${req.headers.origin}/dashboard`,
      metadata: {
        firebaseUid: uid,
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('❌ Stripe session error:', err);
    return res.status(500).json({ error: 'Something went wrong creating the session' });
  }
}
