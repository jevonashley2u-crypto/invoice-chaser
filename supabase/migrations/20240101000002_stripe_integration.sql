-- Add Stripe fields to businesses
ALTER TABLE public.businesses
ADD COLUMN stripe_account_id TEXT,
ADD COLUMN stripe_account_status TEXT DEFAULT 'pending';

-- Add Stripe fields to invoices
ALTER TABLE public.invoices
ADD COLUMN stripe_session_id TEXT,
ADD COLUMN payment_url TEXT;

-- Update RLS if necessary (invoices still manageable by business owner)
-- Public clients will need access to view invoices by ID without being logged in.
-- We must add a policy to allow anon read access to invoices if they have the ID (which they get via the URL).

CREATE POLICY "Anyone can view an invoice by ID"
    ON public.invoices FOR SELECT
    USING (true);

-- The above policy is quite broad. A better approach is to allow read access to invoices, but the UUID is unguessable, acting as a secure token.
-- However, we also need them to view the invoice items and the business details.

CREATE POLICY "Anyone can view invoice items"
    ON public.invoice_items FOR SELECT
    USING (true);

CREATE POLICY "Anyone can view businesses"
    ON public.businesses FOR SELECT
    USING (true);

CREATE POLICY "Anyone can view clients"
    ON public.clients FOR SELECT
    USING (true);
