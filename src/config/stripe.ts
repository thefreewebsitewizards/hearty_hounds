import { loadStripe } from '@stripe/stripe-js';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)
  : null;

export default stripePromise;

// Stripe Connect configuration
export const STRIPE_CONFIG = {
  publishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '',
  // Application fee percentage (7.9% platform fee to reach ~10% total with Stripe fees)
  applicationFeePercent: 0.079,
  // Connected account ID - provided for testing
  // In production, this should be dynamic based on the artist/seller
  connectedAccountId: 'acct_1RrxjBJHHLWU5Kg3', // Platform account - no transfer needed for testing
};

// Helper function to calculate application fee
export const calculateApplicationFee = (amount: number): number => {
  return Math.round(amount * STRIPE_CONFIG.applicationFeePercent);
};

// Helper function to format amount for Stripe (convert to cents)
export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount * 100);
};