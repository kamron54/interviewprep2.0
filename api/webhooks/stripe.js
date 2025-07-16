// /api/webhooks/stripe.js
import Stripe from 'stripe';
import getRawBody from 'raw-body';
import { dbAdmin } from '../../firebase-admin';
import { doc, setDoc } from 'firebase-admin/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: {
    bodyParser: false, // raw-body handles the stream
  },
};

export default async function handler(req, res) {
  console.log('📨 Webhook handler invoked');

  if (req.method !== 'POST') {
    console.warn('❌ Invalid HTTP method:', req.method);
    return res.status(405).send('Method Not Allowed');
  }

  let event;
  try {
    const rawBody = await getRawBody(req);
    const signature = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(
      rawBody.toString(),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log('✅ Stripe event verified:', event.type);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('📦 checkout.session.completed payload:', session.id, session.metadata);

    const uid = session.metadata?.firebaseUid;
    if (!uid) {
      console.warn('⚠️ Missing firebaseUid in metadata');
      return res.status(400).send('Missing UID in metadata');
    }

    try {
      console.log(`🔁 Marking user ${uid} as paid in Firestore`);
      const userRef = doc(dbAdmin, 'users', uid);
      await setDoc(userRef, { hasPaid: true }, { merge: true });
      console.log('✅ Firestore update succeeded for user:', uid);
      return res.status(200).send('User updated');
    } catch (error) {
      console.error('❌ Firestore admin write failed:', error);
      return res.status(500).send('Firestore error');
    }
  }

  console.log('🔍 Unhandled event type:', event.type);
  res.status(200).send('Event received');
}
