-- Create Enum for recurring intervals
CREATE TYPE recurring_interval AS ENUM ('none', 'weekly', 'monthly', 'quarterly', 'yearly');

-- Add recurring options to invoices
ALTER TABLE public.invoices
ADD COLUMN is_recurring BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN recurring_interval recurring_interval NOT NULL DEFAULT 'none',
ADD COLUMN last_recurring_date DATE;

-- Add reminder tracking to invoices
ALTER TABLE public.invoices
ADD COLUMN reminder_due_soon_sent BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN reminder_due_today_sent BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN reminder_overdue_sent BOOLEAN NOT NULL DEFAULT false;

-- Create an index to speed up daily cron queries for unpaid invoices
CREATE INDEX idx_invoices_status_due_date ON public.invoices(status, due_date);
