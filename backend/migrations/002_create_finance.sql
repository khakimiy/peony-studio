-- Migration: create finance table
CREATE TABLE IF NOT EXISTS public.finance (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL, -- 'in' or 'out'
  party text, -- who paid/received
  reason text,
  amount numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_finance_created_at ON public.finance(created_at);
