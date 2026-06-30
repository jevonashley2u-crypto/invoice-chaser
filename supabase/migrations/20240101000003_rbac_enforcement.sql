-- 1. Add user_id to clients for Client Portal linking
ALTER TABLE public.clients
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Create helper function for role evaluation
CREATE OR REPLACE FUNCTION public.get_user_role(bus_id UUID)
RETURNS app_role AS $$
  SELECT role FROM public.user_roles
  WHERE business_id = bus_id AND user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- 3. Drop existing permissive policies
DROP POLICY IF EXISTS "Users can view businesses they belong to." ON public.businesses;
DROP POLICY IF EXISTS "Users can view their own roles." ON public.user_roles;
DROP POLICY IF EXISTS "Users can manage clients of their business" ON public.clients;
DROP POLICY IF EXISTS "Users can manage invoices of their business" ON public.invoices;
DROP POLICY IF EXISTS "Users can manage invoice items of their business" ON public.invoice_items;

-- 4. Businesses Policies
CREATE POLICY "Businesses - Select"
    ON public.businesses FOR SELECT
    USING (public.user_belongs_to_business(id));

CREATE POLICY "Businesses - Update"
    ON public.businesses FOR UPDATE
    USING (public.get_user_role(id) IN ('owner', 'manager'));

-- 5. User Roles Policies
CREATE POLICY "User Roles - Select"
    ON public.user_roles FOR SELECT
    USING (public.user_belongs_to_business(business_id));

CREATE POLICY "User Roles - Insert"
    ON public.user_roles FOR INSERT
    WITH CHECK (public.get_user_role(business_id) = 'owner');

CREATE POLICY "User Roles - Update"
    ON public.user_roles FOR UPDATE
    USING (public.get_user_role(business_id) = 'owner');

CREATE POLICY "User Roles - Delete"
    ON public.user_roles FOR DELETE
    USING (public.get_user_role(business_id) = 'owner');

-- 6. Clients Policies
CREATE POLICY "Clients - Select"
    ON public.clients FOR SELECT
    USING (
        public.get_user_role(business_id) IN ('owner', 'manager', 'employee', 'accountant')
        OR user_id = auth.uid()
    );

CREATE POLICY "Clients - Insert"
    ON public.clients FOR INSERT
    WITH CHECK (public.get_user_role(business_id) IN ('owner', 'manager', 'employee'));

CREATE POLICY "Clients - Update"
    ON public.clients FOR UPDATE
    USING (public.get_user_role(business_id) IN ('owner', 'manager', 'employee'));

CREATE POLICY "Clients - Delete"
    ON public.clients FOR DELETE
    USING (public.get_user_role(business_id) IN ('owner', 'manager'));

-- 7. Invoices Policies
CREATE POLICY "Invoices - Select"
    ON public.invoices FOR SELECT
    USING (
        public.get_user_role(business_id) IN ('owner', 'manager', 'employee', 'accountant')
        OR client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
    );

CREATE POLICY "Invoices - Insert"
    ON public.invoices FOR INSERT
    WITH CHECK (public.get_user_role(business_id) IN ('owner', 'manager', 'employee'));

CREATE POLICY "Invoices - Update"
    ON public.invoices FOR UPDATE
    USING (public.get_user_role(business_id) IN ('owner', 'manager', 'employee', 'accountant'));

CREATE POLICY "Invoices - Delete"
    ON public.invoices FOR DELETE
    USING (public.get_user_role(business_id) IN ('owner', 'manager'));

-- 8. Invoice Items Policies
CREATE POLICY "Invoice Items - Select"
    ON public.invoice_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.invoices
            WHERE invoices.id = invoice_items.invoice_id
            AND (
                public.get_user_role(invoices.business_id) IN ('owner', 'manager', 'employee', 'accountant')
                OR invoices.client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
            )
        )
    );

CREATE POLICY "Invoice Items - Insert"
    ON public.invoice_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.invoices
            WHERE invoices.id = invoice_items.invoice_id
            AND public.get_user_role(invoices.business_id) IN ('owner', 'manager', 'employee')
        )
    );

CREATE POLICY "Invoice Items - Update"
    ON public.invoice_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.invoices
            WHERE invoices.id = invoice_items.invoice_id
            AND public.get_user_role(invoices.business_id) IN ('owner', 'manager', 'employee', 'accountant')
        )
    );

CREATE POLICY "Invoice Items - Delete"
    ON public.invoice_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.invoices
            WHERE invoices.id = invoice_items.invoice_id
            AND public.get_user_role(invoices.business_id) IN ('owner', 'manager')
        )
    );
