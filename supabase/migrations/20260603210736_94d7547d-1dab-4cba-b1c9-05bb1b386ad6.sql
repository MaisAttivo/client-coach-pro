ALTER TABLE public.fin_debts
  ADD COLUMN IF NOT EXISTS valor_pago numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS data_prevista date;