// /api/webhooks/stripe.js
import Stripe from 'stripe';
import getRawBody from 'raw-body';
import admin from '../../firebase-admin';      // <— namespaced import
const db = admin.firestore();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  console.log('📨 Webhook hit');

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  let event;
  try {
    const buf = await getRawBody(req);
    event = stripe.webhooks.constructEvent(
      buf.toString(),
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log('✅ Stripe signature verified:', event.type);
  } catch (err) {
    console.error('❌ Signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const uid = session.metadata?.firebaseUid;
    console.log('📦 Session metadata:', session.metadata);

    if (!uid) {
      console.warn('⚠️ Missing firebaseUid');
      return res.status(400).send('Missing UID');
    }

    try {
      const paidAt = new Date();
      const subscriptionEndsAt = new Date(paidAt);
      subscriptionEndsAt.setDate(subscriptionEndsAt.getDate() + 365);

      console.log(`🔁 Writing hasPaid=true, paidAt, subscriptionEndsAt for UID=${uid}`);
      await db.collection('users').doc(uid).set(
        {
          hasPaid: true,
          paidAt: admin.firestore.Timestamp.fromDate(paidAt),
          subscriptionEndsAt: admin.firestore.Timestamp.fromDate(subscriptionEndsAt),
        },
        { merge: true }
      );
      console.log('✅ Firestore write succeeded');
      return res.status(200).send('User updated');
    } catch (err) {
      console.error('❌ Firestore write failed:', err);
      return res.status(500).send('Firestore error');
    }
  }

  console.log('🔍 Unhandled event type:', event.type);
  res.status(200).send('Event ignored');
}
