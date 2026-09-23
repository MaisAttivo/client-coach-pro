CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  titulo text NOT NULL,
  notas text,
  sistema text NOT NULL DEFAULT 'geral',
  prioridade integer NOT NULL DEFAULT 1,
  due_date date,
  done boolean NOT NULL DEFAULT false,
  done_at timestamptz,
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner read tasks" ON public.tasks FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owner insert tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owner update tasks" ON public.tasks FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owner delete tasks" ON public.tasks FOR DELETE TO authenticated USING (auth.uid() = owner_id);

CREATE TRIGGER tasks_set_updated_at BEFORE UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX tasks_owner_done_idx ON public.tasks (owner_id, done, ordem);
