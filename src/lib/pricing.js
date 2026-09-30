// Everything about plans lives here: shown on the site, charged by api/create-checkout-session.js,
// and turned into days of access by api/webhooks/stripe.js. Plain data only — the API imports it.
//
// `amount` is exactly what customers are charged; to change a price, change it here.
// The Stripe products only supply the name shown at checkout and on receipts.
export const FREE_TRIAL_SESSIONS = 2;

export const PLANS = {
  month: { id: 'month', name: '1 Month', amount: 39, days: 30, stripeProductId: 'prod_VLyb6Fe2eeYUB2' },
  year: { id: 'year', name: '12 Months', amount: 49, days: 365, stripeProductId: 'prod_VLydmFxSNrV2X7' },
};

export const formatPrice = (amount) => `$${amount}`;
