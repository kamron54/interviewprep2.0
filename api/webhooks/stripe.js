import Stripe from 'stripe';
import { buffer } from 'micro';
import { db } from '../../firebase'; // adjust path if needed
import { doc, setDoc } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: {
    bodyParser: false, // Stripe requires the raw body
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  const sig = req.headers['stripe-signature'];

  let event;

  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(
      rawBody.toString(),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('❌ Stripe webhook verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const uid = session.metadata?.firebaseUid;

    if (!uid) {
      console.warn('⚠️ No UID found in Stripe metadata');
      return res.status(400).send('Missing UID in session metadata');
    }

    try {
      await setDoc(doc(db, 'users', uid), { hasPaid: true }, { merge: true });
      console.log(`✅ Marked user ${uid} as paid`);
      return res.status(200).send('User marked as paid');
    } catch (error) {
      console.error('❌ Firestore update failed:', error);
      return res.status(500).send('Failed to update user');
    }
  }

  // Respond to all other event types (optional)
  res.status(200).send('Event received');
}
