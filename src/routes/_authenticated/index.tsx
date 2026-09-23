import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Check,
  ChevronRight,
  Circle,
  LayoutGrid,
  LogOut,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PRIORIDADES,
  SISTEMAS,
  clearDone,
  createTask,
  deleteTask,
  listTasks,
  sistemaLabel,
  toggleTask,
  updateTask,
  type Task,
} from "@/lib/tasks";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Tarefas pendentes — JP HUB" },
      {
        name: "description",
        content: "Lista de tarefas pendentes de todos os sistemas, com notas, prioridade e prazos.",
      },
      { property: "og:title", content: "Tarefas pendentes — JP HUB" },
      { property: "og:description", content: "Tudo o que está por fazer, num só sítio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TasksPage,
});

const PRIO_STYLE: Record<number, string> = {
  2: "text-red-400 border-red-400/30 bg-red-400/10",
  1: "text-primary border-primary/25 bg-primary/10",
  0: "text-muted-foreground border-border bg-background",
};

function TasksPage() {
  const { signOut } = useAuth();
  const qc = useQueryClient();
  const [titulo, setTitulo] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [showDone, setShowDone] = useState(false);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: listTasks,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["tasks"] });

  const add = useMutation({
    mutationFn: (t: string) => createTask({ titulo: t }),
    onSuccess: () => {
      setTitulo("");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: ({ id, done }: { id: string; done: boolean }) => toggleTask(id, done),
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const patch = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) => updateTask(id, data),
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      setOpenId(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const clear = useMutation({
    mutationFn: clearDone,
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const pendentes = tasks.filter((t) => !t.done);
  const feitas = tasks.filter((t) => t.done);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="min-h-screen bg-background">
      <header className="max-w-2xl mx-auto px-5 pt-8 pb-2 flex items-end justify-between">
        <div>
          <p className="text-[9px] uppercase tracking-[0.32em] text-primary font-medium">
            Por fazer
          </p>
          <h1 className="font-display text-3xl leading-none mt-1.5 font-semibold tracking-tight">
            Tarefas
          </h1>
          <p className="text-xs text-muted-foreground mt-2">
            {pendentes.length === 0
              ? "Nada pendente. Tudo em dia."
              : `${pendentes.length} ${pendentes.length === 1 ? "tarefa pendente" : "tarefas pendentes"}`}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="icon" className="rounded-full hover:bg-surface">
            <Link to="/hub" aria-label="Abrir hub">
              <LayoutGrid className="w-4 h-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            aria-label="Sair"
            className="rounded-full hover:bg-surface"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 pb-20">
        <form
          className="flex gap-2 mt-6"
          onSubmit={(e) => {
            e.preventDefault();
            const v = titulo.trim();
            if (v) add.mutate(v);
          }}
        >
          <Input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="O que é preciso fazer?"
            className="bg-surface border-border"
          />
          <Button type="submit" disabled={!titulo.trim() || add.isPending} className="shrink-0">
            <Plus className="w-4 h-4" />
          </Button>
        </form>

        {isLoading ? (
          <p className="text-xs text-muted-foreground mt-8">A carregar…</p>
        ) : (
          <ul className="mt-5 space-y-2">
            {pendentes.map((t) => (
              <TaskRow
                key={t.id}
                task={t}
                open={openId === t.id}
                today={today}
                onOpen={() => setOpenId(openId === t.id ? null : t.id)}
                onToggle={() => toggle.mutate({ id: t.id, done: true })}
                onPatch={(data) => patch.mutate({ id: t.id, data })}
                onDelete={() => remove.mutate(t.id)}
              />
            ))}
            {pendentes.length === 0 && (
              <li className="text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl py-10">
                Sem tarefas pendentes.
              </li>
            )}
          </ul>
        )}

        {feitas.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowDone((s) => !s)}
                className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
              >
                Concluídas ({feitas.length})
              </button>
              {showDone && (
                <button
                  onClick={() => clear.mutate()}
                  className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-red-400"
                >
                  Limpar
                </button>
              )}
            </div>
            {showDone && (
              <ul className="mt-3 space-y-2">
                {feitas.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center gap-3 bg-surface/50 border border-border rounded-xl px-3 py-2.5"
                  >
                    <button
                      onClick={() => toggle.mutate({ id: t.id, done: false })}
                      aria-label="Reabrir"
                      className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <span className="text-sm line-through text-muted-foreground flex-1">
                      {t.titulo}
                    </span>
                    <button
                      onClick={() => remove.mutate(t.id)}
                      aria-label="Eliminar"
                      className="text-muted-foreground hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function TaskRow({
  task,
  open,
  today,
  onOpen,
  onToggle,
  onPatch,
  onDelete,
}: {
  task: Task;
  open: boolean;
  today: string;
  onOpen: () => void;
  onToggle: () => void;
  onPatch: (data: Partial<Task>) => void;
  onDelete: () => void;
}) {
  const [titulo, setTitulo] = useState(task.titulo);
  const [notas, setNotas] = useState(task.notas ?? "");
  const atrasada = task.due_date && task.due_date < today;

  return (
    <li className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-3 py-3">
        <button
          onClick={onToggle}
          aria-label="Marcar como feito"
          className="w-5 h-5 rounded-full border border-border text-transparent hover:border-primary hover:text-primary flex items-center justify-center shrink-0 transition-colors"
        >
          <Check className="w-3 h-3" />
        </button>
        <button onClick={onOpen} className="flex-1 text-left min-w-0">
          <p className="text-sm truncate">{task.titulo}</p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-[9px] uppercase tracking-[0.14em] px-1.5 py-0.5 rounded border ${PRIO_STYLE[task.prioridade] ?? PRIO_STYLE[1]}`}
            >
              {sistemaLabel(task.sistema)}
            </span>
            {task.due_date && (
              <span
                className={`text-[10px] ${atrasada ? "text-red-400" : "text-muted-foreground"}`}
              >
                {task.due_date.split("-").reverse().join("/")}
              </span>
            )}
            {task.notas && <Circle className="w-1.5 h-1.5 fill-current text-muted-foreground" />}
          </div>
        </button>
        <ChevronRight
          className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`}
        />
      </div>

      {open && (
        <div className="border-t border-border px-3 py-4 space-y-3 bg-background/40">
          <Input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            onBlur={() => titulo.trim() && titulo !== task.titulo && onPatch({ titulo: titulo.trim() })}
            placeholder="Título"
            className="bg-surface border-border"
          />
          <Textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            onBlur={() => notas !== (task.notas ?? "") && onPatch({ notas: notas || null })}
            placeholder="Notas — detalhes do que é preciso fazer"
            rows={3}
            className="bg-surface border-border"
          />
          <div className="grid grid-cols-2 gap-2">
            <Select value={task.sistema} onValueChange={(v) => onPatch({ sistema: v })}>
              <SelectTrigger className="bg-surface border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SISTEMAS.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={String(task.prioridade)}
              onValueChange={(v) => onPatch({ prioridade: Number(v) })}
            >
              <SelectTrigger className="bg-surface border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORIDADES.map((p) => (
                  <SelectItem key={p.value} value={String(p.value)}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={task.due_date ?? ""}
              onChange={(e) => onPatch({ due_date: e.target.value || null })}
              className="bg-surface border-border"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              aria-label="Eliminar tarefa"
              className="shrink-0 text-muted-foreground hover:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}
