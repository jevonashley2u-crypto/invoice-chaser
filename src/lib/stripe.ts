import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_123', {
  apiVersion: '2026-06-24.dahlia' as any, // latest version
  appInfo: {
    name: 'InvoiceOS AI',
    version: '0.1.0',
  },
})
