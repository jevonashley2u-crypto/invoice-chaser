-- Create subscription status enum
CREATE TYPE subscription_status AS ENUM (
  'active', 
  'trialing', 
  'past_due', 
  'canceled', 
  'unpaid', 
  'incomplete', 
  'incomplete_expired', 
  'paused',
  'none'
);

-- Create billing tier enum
CREATE TYPE billing_tier AS ENUM ('starter', 'pro', 'business');

-- Add SaaS billing fields to businesses table
ALTER TABLE public.businesses
ADD COLUMN stripe_customer_id TEXT UNIQUE,
ADD COLUMN stripe_subscription_id TEXT UNIQUE,
ADD COLUMN stripe_price_id TEXT,
ADD COLUMN subscription_status subscription_status NOT NULL DEFAULT 'none',
ADD COLUMN current_period_end TIMESTAMPTZ,
ADD COLUMN tier billing_tier NOT NULL DEFAULT 'starter';

-- Drop the old stripe_account_id if we are using Standard Stripe instead of Connect
-- (Actually, we will keep it for now just in case, or drop it to enforce standard Stripe only)
-- The user explicitly said NO Stripe Connect, so we can safely remove it to clean up the schema.
ALTER TABLE public.businesses
DROP COLUMN IF EXISTS stripe_account_id;
