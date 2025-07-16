import Stripe from 'stripe';
import getRawBody from 'raw-body';
import { dbAdmin } from '../../firebase-admin';          // admin export
import { doc, setDoc } from 'firebase-admin/firestore';  // admin SDK

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: {
    bodyParser: false, // raw-body is handling it
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
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
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const uid = session.metadata?.firebaseUid;
    if (!uid) {
      console.warn('⚠️ Missing firebaseUid in metadata');
      return res.status(400).send('Missing UID');
    }

    try {
      // Use the admin SDK's Firestore
      await setDoc(doc(dbAdmin, 'users', uid), { hasPaid: true }, { merge: true });
      console.log(`✅ Marked user ${uid} as paid`);
      return res.status(200).send('User updated');
    } catch (error) {
      console.error('❌ Firestore admin write failed:', error);
      return res.status(500).send('Firestore error');
    }
  }

  // For other event types
  res.status(200).send('Event received');
}
