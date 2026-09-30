// /api/webhooks/stripe.js
import Stripe from 'stripe';
import getRawBody from 'raw-body';
import admin from '../../firebase-admin';      // <— namespaced import
import { PLANS } from '../../src/lib/pricing.js';
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

    // Checkouts started before plans existed have no plan; they were all 12 months
    const plan = PLANS[session.metadata?.plan] || PLANS.year;

    try {
      const userRef = db.collection('users').doc(uid);
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(userRef);

        // Stripe can deliver the same event more than once; only add time once per checkout
        if ((snap.get('checkoutSessionIds') || []).includes(session.id)) {
          console.log(`↩️ Checkout ${session.id} already applied`);
          return;
        }

        // Buying while access is still active adds time on top of what's left
        const paidAt = new Date();
        const storedEnd = snap.get('subscriptionEndsAt');
        const currentEnd = typeof storedEnd?.toDate === 'function' ? storedEnd.toDate() : null;
        const start = currentEnd && currentEnd > paidAt ? currentEnd : paidAt;
        const subscriptionEndsAt = new Date(start);
        subscriptionEndsAt.setDate(subscriptionEndsAt.getDate() + plan.days);

        console.log(`🔁 Adding ${plan.days} days (${plan.id}) for UID=${uid}, access until ${subscriptionEndsAt.toISOString()}`);
        tx.set(
          userRef,
          {
            hasPaid: true,
            plan: plan.id,
            paidAt: admin.firestore.Timestamp.fromDate(paidAt),
            subscriptionEndsAt: admin.firestore.Timestamp.fromDate(subscriptionEndsAt),
            checkoutSessionIds: admin.firestore.FieldValue.arrayUnion(session.id),
          },
          { merge: true }
        );
      });
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
