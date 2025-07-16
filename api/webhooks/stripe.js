import Stripe from 'stripe';
import getRawBody from 'raw-body';
import { db } from '../../firebase-admin'; // adjust if your Firebase file is in a different folder
import { doc, setDoc } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: {
    bodyParser: false,
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

  // ✅ Handle the payment success
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const uid = session.metadata?.firebaseUid;

    if (!uid) {
      console.warn('⚠️ No UID found in Stripe metadata');
      return res.status(400).send('Missing UID in metadata');
    }

    try {
      await setDoc(doc(db, 'users', uid), { hasPaid: true }, { merge: true });
      console.log(`✅ User ${uid} marked as paid`);
      return res.status(200).send('User updated');
    } catch (error) {
      console.error('❌ Firestore update failed:', error);
      return res.status(500).send('Firestore error');
    }
  }

  // Other event types can be handled here if needed
  res.status(200).send('Event received');
}
