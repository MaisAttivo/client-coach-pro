import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarClock,
  Check,
  ChevronDown,
  ChevronRight,
  Clapperboard,
  Loader2,
  RotateCcw,
  Search,
  Tv,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DOOMSDAY_DATE } from "@/lib/mcu-catalog";
import {
  listMcuItems,
  resetMcu,
  seedMcu,
  setWatched,
  setWatchedBulk,
  type McuItem,
} from "@/lib/mcu-rewatch";

export const Route = createFileRoute("/_authenticated/jogos/marvel")({
  head: () => ({
    meta: [
      { title: "Marvel Rewatch — antes de Avengers: Doomsday" },
      {
        name: "description",
        content:
          "Controla filmes e episódios Marvel vistos, percentagem de conclusão e ritmo semanal necessário até 18 de dezembro de 2026.",
      },
      { property: "og:title", content: "Marvel Rewatch" },
      {
        property: "og:description",
        content: "Progresso do rewatch Marvel até Avengers: Doomsday.",
      },
    ],
  }),
  component: MarvelRewatchPage,
});

type Group = {
  key: string;
  label: string;
  phase: string | null;
  year: number | null;
  isSeries: boolean;
  items: McuItem[];
};

function fmtHours(min: number) {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return h > 0 ? `${h}h${m ? ` ${m}m` : ""}` : `${m}m`;
}

function MarvelRewatchPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [onlyMissing, setOnlyMissing] = useState(false);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["mcu_items"],
    queryFn: listMcuItems,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["mcu_items"] });

  const seed = useMutation({
    mutationFn: () => seedMcu(user!.id),
    onSuccess: invalidate,
  });
  const reset = useMutation({
    mutationFn: () => resetMcu(user!.id),
    onSuccess: invalidate,
  });
  const rebuild = useMutation({
    mutationFn: async () => {
      await resetMcu(user!.id);
      return seedMcu(user!.id);
    },
    onSuccess: invalidate,
  });

  const toggle = useMutation({
    mutationFn: (v: { id: string; watched: boolean }) => setWatched(v.id, v.watched),
    onSuccess: invalidate,
  });
  const bulk = useMutation({
    mutationFn: (v: { ids: string[]; watched: boolean }) => setWatchedBulk(v.ids, v.watched),
    onSuccess: invalidate,
  });

  const total = items.length;
  const watchedCount = items.filter((i) => i.watched).length;
  const pct = total ? (watchedCount / total) * 100 : 0;
  const remaining = total - watchedCount;
  const remainingMin = items.filter((i) => !i.watched).reduce((s, i) => s + i.runtime_min, 0);

  const weeksLeft = useMemo(() => {
    const target = new Date(`${DOOMSDAY_DATE}T00:00:00`);
    const days = Math.max(0, (target.getTime() - Date.now()) / 86_400_000);
    return days / 7;
  }, []);

  const perWeek = weeksLeft > 0 ? remaining / weeksLeft : remaining;
  const minPerWeek = weeksLeft > 0 ? remainingMin / weeksLeft : remainingMin;
  const daysLeft = Math.ceil(weeksLeft * 7);

  const groups = useMemo<Group[]>(() => {
    const map = new Map<string, Group>();
    for (const it of items) {
      const key = it.series ?? `f:${it.id}`;
      let g = map.get(key);
      if (!g) {
        g = {
          key,
          label: it.series ?? it.title,
          phase: it.phase,
          year: it.year,
          isSeries: Boolean(it.series),
          items: [],
        };
        map.set(key, g);
      }
      g.items.push(it);
    }
    let list = [...map.values()];
    const term = q.trim().toLowerCase();
    if (term) list = list.filter((g) => g.label.toLowerCase().includes(term));
    if (onlyMissing) list = list.filter((g) => g.items.some((i) => !i.watched));
    return list;
  }, [items, q, onlyMissing]);

  if (isLoading) {
    return (
      <main className="px-5 py-16 flex justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </main>
    );
  }

  if (!total) {
    return (
      <main className="px-5 pb-16">
        <div className="bg-surface border border-border rounded-2xl p-6 text-center">
          <Clapperboard className="w-8 h-8 text-primary mx-auto mb-3" />
          <h2 className="font-display text-xl font-semibold">Marvel Rewatch</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Cria a lista completa de filmes e episódios a ver antes de{" "}
            <strong>Avengers: Doomsday</strong> (18 dez 2026).
          </p>
          <Button className="mt-5" onClick={() => seed.mutate()} disabled={seed.isPending}>
            {seed.isPending ? "A criar…" : "Criar lista"}
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="px-5 pb-24">
      {/* Progresso */}
      <section className="bg-surface border border-border rounded-2xl p-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-[0.28em] text-primary font-medium">
              Conclusão
            </p>
            <p className="font-display text-4xl font-semibold tracking-tight mt-1">
              {pct.toFixed(1)}%
            </p>
          </div>
          <p className="text-xs text-muted-foreground text-right">
            {watchedCount} / {total} vistos
            <br />
            faltam {fmtHours(remainingMin)}
          </p>
        </div>
        <div className="h-2 rounded-full bg-background mt-4 overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
      </section>

      {/* Ritmo */}
      <section className="grid grid-cols-2 gap-3 mt-3">
        <div className="bg-surface border border-border rounded-2xl p-4">
          <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            Ritmo necessário
          </p>
          <p className="font-display text-2xl font-semibold mt-1">
            {perWeek.toFixed(1)}
            <span className="text-sm font-normal text-muted-foreground"> /semana</span>
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            ≈ {fmtHours(minPerWeek)} por semana · {(perWeek / 7).toFixed(1)} por dia
          </p>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-4">
          <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            <CalendarClock className="w-3 h-3 inline mr-1" />
            Até 18 dez 2026
          </p>
          <p className="font-display text-2xl font-semibold mt-1">{daysLeft} dias</p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {weeksLeft.toFixed(1)} semanas · {remaining} por ver
          </p>
        </div>
      </section>

      {/* Filtros */}
      <div className="flex gap-2 mt-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Procurar filme ou série…"
            className="pl-9"
          />
        </div>
        <Button
          variant={onlyMissing ? "default" : "outline"}
          onClick={() => setOnlyMissing((v) => !v)}
        >
          Por ver
        </Button>
      </div>

      {/* Lista */}
      <ul className="mt-4 space-y-2">
        {groups.map((g) => {
          const done = g.items.filter((i) => i.watched).length;
          const all = done === g.items.length;
          if (!g.isSeries) {
            const it = g.items[0];
            return (
              <li key={g.key}>
                <button
                  onClick={() => toggle.mutate({ id: it.id, watched: !it.watched })}
                  className="w-full flex items-center gap-3 bg-surface border border-border rounded-xl p-3 text-left hover:border-primary/40"
                >
                  <span
                    className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 ${
                      it.watched
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-border"
                    }`}
                  >
                    {it.watched && <Check className="w-4 h-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-sm truncate ${it.watched ? "line-through text-muted-foreground" : ""}`}
                    >
                      {it.title}
                    </span>
                    <span className="block text-[11px] text-muted-foreground">
                      {it.year} · {it.phase} · {fmtHours(it.runtime_min)}
                    </span>
                  </span>
                  <Clapperboard className="w-4 h-4 text-muted-foreground shrink-0" />
                </button>
              </li>
            );
          }
          const isOpen = open[g.key];
          return (
            <li key={g.key} className="bg-surface border border-border rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 p-3">
                <button
                  onClick={() => setOpen((o) => ({ ...o, [g.key]: !o[g.key] }))}
                  className="flex items-center gap-3 min-w-0 flex-1 text-left"
                >
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm truncate">{g.label}</span>
                    <span className="block text-[11px] text-muted-foreground">
                      {g.year} · {g.phase} · {done}/{g.items.length} episódios
                    </span>
                  </span>
                  <Tv className="w-4 h-4 text-muted-foreground shrink-0" />
                </button>
                <button
                  onClick={() =>
                    bulk.mutate({ ids: g.items.map((i) => i.id), watched: !all })
                  }
                  className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 ${
                    all ? "bg-primary border-primary text-primary-foreground" : "border-border"
                  }`}
                  aria-label={all ? "Desmarcar série" : "Marcar série toda"}
                >
                  {all && <Check className="w-4 h-4" />}
                </button>
              </div>
              {isOpen && (
                <ul className="border-t border-border divide-y divide-border">
                  {g.items.map((ep) => (
                    <li key={ep.id}>
                      <button
                        onClick={() => toggle.mutate({ id: ep.id, watched: !ep.watched })}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-background/50"
                      >
                        <span
                          className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                            ep.watched
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-border"
                          }`}
                        >
                          {ep.watched && <Check className="w-3 h-3" />}
                        </span>
                        <span
                          className={`text-xs ${ep.watched ? "line-through text-muted-foreground" : ""}`}
                        >
                          {ep.title}
                        </span>
                        <span className="ml-auto text-[10px] text-muted-foreground">
                          {ep.runtime_min}m
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex justify-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          disabled={rebuild.isPending}
          onClick={() => {
            if (confirm("Recriar a lista pela ordem cronológica? Perdes as marcações atuais."))
              rebuild.mutate();
          }}
        >
          <RotateCcw className="w-3.5 h-3.5 mr-2" />
          {rebuild.isPending ? "A recriar…" : "Recriar lista"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => {
            if (confirm("Apagar toda a lista do Marvel Rewatch?")) reset.mutate();
          }}
        >
          Apagar
        </Button>
      </div>

    </main>
  );
}
