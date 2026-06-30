-- Add Stripe Connect Account ID to businesses table
ALTER TABLE public.businesses
ADD COLUMN stripe_account_id TEXT UNIQUE;
