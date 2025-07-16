// pages/api/create-checkout-session.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // You can pull authenticated user info here if needed
    const session = await stripe.checkout.sessions.create({
      mode: 'payment', // or 'subscription' if using recurring billing
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1RlNb5HJuEuytDk1mwf1e1hh', // Replace this with your actual Stripe Price ID
          quantity: 1,
        },
      ],
      success_url: `${req.headers.origin}/success`,
      cancel_url: `${req.headers.origin}/cancel`,
      metadata: {
        // optional: store user ID or email
      },
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe session error:', err);
    res.status(500).json({ error: 'Something went wrong creating the session' });
  }
}
