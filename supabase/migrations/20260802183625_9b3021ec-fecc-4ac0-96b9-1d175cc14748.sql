CREATE TABLE public.mcu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('filme','episodio')),
  title text NOT NULL,
  series text,
  season integer,
  episode integer,
  year integer,
  runtime_min integer NOT NULL DEFAULT 0,
  phase text,
  order_index integer NOT NULL DEFAULT 0,
  watched boolean NOT NULL DEFAULT false,
  watched_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mcu_items TO authenticated;
GRANT ALL ON public.mcu_items TO service_role;

ALTER TABLE public.mcu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own mcu items" ON public.mcu_items
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX mcu_items_user_order_idx ON public.mcu_items (user_id, order_index);

CREATE TRIGGER mcu_items_set_updated_at
  BEFORE UPDATE ON public.mcu_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();