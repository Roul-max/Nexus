import Stripe from 'stripe';

export const getStripe = (): Stripe => {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('STRIPE_SECRET_KEY is not defined in production');
    }

    console.warn(
      'STRIPE_SECRET_KEY is missing. Using mock Stripe client for development.'
    );
  }

  return new Stripe(stripeSecretKey || 'sk_test_mock', {
    apiVersion: '2024-04-10',
    appInfo: {
      name: 'Nexus Platform',
      version: '0.1.0',
    },
  });
};

export const formatAmountForDisplay = (
  amount: number,
  currency: string
): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol',
  }).format(amount / 100);
};

export const formatAmountForStripe = (
  amount: number,
  currency: string
): number => {
  const parts = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol',
  }).formatToParts(amount);

  const zeroDecimalCurrency = !parts.some(
    (part) => part.type === 'decimal'
  );

  return zeroDecimalCurrency
    ? Math.round(amount)
    : Math.round(amount * 100);
};