// Everything about plans lives here: shown on the site, charged by api/create-checkout-session.js,
// and turned into days of access by api/webhooks/stripe.js. Plain data only — the API imports it.
//
// Customers are charged the Stripe price (`stripePriceId`); `amount` is what the site displays.
// Keep them matching. Stripe prices can't be edited, so to change a price: create a new one-time
// price on the product in Stripe, then update both `amount` and `stripePriceId` here.
export const FREE_TRIAL_SESSIONS = 2;
export const FREE_TRIAL_DAYS = 7;

export const PLANS = {
  month: { id: 'month', name: '1 Month', amount: 39, days: 30, stripePriceId: 'price_1ULGemHtr4snLcWRPNLjta9x' },
  year: { id: 'year', name: '12 Months', amount: 49, days: 365, stripePriceId: 'price_1ULGgNHtr4snLcWRLvef42cn' },
};

export const formatPrice = (amount) => `$${amount}`;
