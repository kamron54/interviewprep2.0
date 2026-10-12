import Stripe from 'stripe';
import admin, { getUserFromRequest } from '../firebase-admin';
import { PLANS, SURVEY_COUPON_ID } from '../src/lib/pricing.js';

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

    const createSession = (withSurveyDiscount) => stripe.checkout.sessions.create({
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
      // Stripe takes one or the other: the survey thank-you, or a promo code field
      ...(withSurveyDiscount ? { discounts: [{ coupon: SURVEY_COUPON_ID }] } : { allow_promotion_codes: true }),
    });

    // Answering the survey (api/survey.js) takes $10 off 12 months, applied here instead of by a code
    const answeredSurvey = plan.id === 'year'
      && (await admin.firestore().collection('surveyResponses').doc(user.uid).get()).exists;

    let session;
    try {
      session = await createSession(answeredSurvey);
    } catch (err) {
      // If the coupon is missing in Stripe, still let them buy (at full price) rather than fail
      if (!answeredSurvey || err.code !== 'resource_missing') throw err;
      console.error(`❌ Stripe coupon "${SURVEY_COUPON_ID}" not found; charging full price`);
      session = await createSession(false);
    }

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('❌ Stripe session error:', err);
    return res.status(500).json({ error: 'Something went wrong creating the session' });
  }
}
