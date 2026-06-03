import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Plus, Trash2, Check, RotateCcw, ArrowDownLeft, ArrowUpRight,
  Search, Users, List, AlertCircle, CalendarClock, Wallet,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  listDebts, deleteDebt, togglePago, addPartialPayment, type FinDebt,
} from "@/lib/fin-debts";
import { DebtDialog } from "@/components/financas/DebtDialog";
import { fmtEUR } from "@/lib/pt-clients";

export const Route = createFileRoute("/_authenticated/financas/dividas")({
  head: () => ({ meta: [{ title: "Dívidas · Finanças" }] }),
  component: DividasPage,
});

type StatusFilter = "pendentes" | "pagas" | "todas";
type DirFilter = "todas" | "devo" | "devem";
type Sort = "data" | "valor" | "pessoa" | "prevista";
type View = "lista" | "pessoa";

const todayISO = () => new Date().toISOString().slice(0, 10);

function DividasPage() {
  const [status, setStatus] = useState<StatusFilter>("pendentes");
  const [dir, setDir] = useState<DirFilter>("todas");
  const [sort, setSort] = useState<Sort>("data");
  const [view, setView] = useState<View>("lista");
  const [q, setQ] = useState("");

  const [debtOpen, setDebtOpen] = useState(false);
  const [editing, setEditing] = useState<FinDebt | null>(null);
  const [presetPessoa, setPresetPessoa] = useState<string | undefined>();

  const [payOpen, setPayOpen] = useState(false);
  const [payTarget, setPayTarget] = useState<FinDebt | null>(null);
  const [payValue, setPayValue] = useState("");

  const { data: debts = [], isLoading, refetch } = useQuery({
    queryKey: ["fin_debts"], queryFn: listDebts,
  });

  const stats = useMemo(() => {
    const pendentes = debts.filter((d) => !d.pago);
    const devoTotal = pendentes.filter((d) => d.direcao === "devo")
      .reduce((s, d) => s + Math.max(0, Number(d.valor) - Number(d.valor_pago ?? 0)), 0);
    const devemTotal = pendentes.filter((d) => d.direcao === "devem")
      .reduce((s, d) => s + Math.max(0, Number(d.valor) - Number(d.valor_pago ?? 0)), 0);
    const t = todayISO();
    const atrasadas = pendentes.filter((d) => d.data_prevista && d.data_prevista < t).length;
    return { devoTotal, devemTotal, saldo: devemTotal - devoTotal, atrasadas, total: pendentes.length };
  }, [debts]);

  const filtered = useMemo(() => {
    let list = debts.slice();
    if (status === "pendentes") list = list.filter((d) => !d.pago);
    else if (status === "pagas") list = list.filter((d) => d.pago);
    if (dir !== "todas") list = list.filter((d) => d.direcao === dir);
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter((d) =>
        d.pessoa.toLowerCase().includes(needle) ||
        (d.descricao ?? "").toLowerCase().includes(needle) ||
        (d.notas ?? "").toLowerCase().includes(needle)
      );
    }
    list.sort((a, b) => {
      if (sort === "valor") return Number(b.valor) - Number(a.valor);
      if (sort === "pessoa") return a.pessoa.localeCompare(b.pessoa, "pt");
      if (sort === "prevista") {
        const av = a.data_prevista ?? "9999-12-31";
        const bv = b.data_prevista ?? "9999-12-31";
        return av.localeCompare(bv);
      }
      return b.data.localeCompare(a.data);
    });
    return list;
  }, [debts, status, dir, q, sort]);

  const grouped = useMemo(() => {
    const map = new Map<string, { pessoa: string; devo: number; devem: number; items: FinDebt[] }>();
    for (const d of filtered) {
      const k = d.pessoa.trim().toLowerCase();
      const g = map.get(k) ?? { pessoa: d.pessoa, devo: 0, devem: 0, items: [] };
      const restante = Math.max(0, Number(d.valor) - Number(d.valor_pago ?? 0));
      if (!d.pago) {
        if (d.direcao === "devo") g.devo += restante;
        else g.devem += restante;
      }
      g.items.push(d);
      map.set(k, g);
    }
    return Array.from(map.values()).sort((a, b) =>
      Math.abs(b.devem - b.devo) - Math.abs(a.devem - a.devo)
    );
  }, [filtered]);

  const handleDel = async (id: string) => {
    if (!confirm("Eliminar dívida?")) return;
    try { await deleteDebt(id); toast.success("Eliminada"); refetch(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Erro"); }
  };
  const handleToggle = async (d: FinDebt) => {
    try { await togglePago(d.id, !d.pago, Number(d.valor)); refetch(); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Erro"); }
  };

  const openNew = (pessoa?: string) => {
    setEditing(null); setPresetPessoa(pessoa); setDebtOpen(true);
  };
  const openEdit = (d: FinDebt) => { setEditing(d); setPresetPessoa(undefined); setDebtOpen(true); };

  const openPay = (d: FinDebt) => {
    setPayTarget(d);
    setPayValue(String(Math.max(0, Number(d.valor) - Number(d.valor_pago ?? 0))));
    setPayOpen(true);
  };
  const confirmPay = async () => {
    if (!payTarget) return;
    const amt = Number(payValue);
    if (!amt || amt <= 0) { toast.error("Valor inválido"); return; }
    try {
      await addPartialPayment(payTarget, amt);
      toast.success("Pagamento registado");
      setPayOpen(false);
      refetch();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Erro"); }
  };

  return (
    <main className="px-5 pt-2 pb-6 space-y-4">
      {/* Resumo */}
      <Card className="p-5 bg-gradient-to-br from-accent to-surface border-accent/50">
        <p className="text-[11px] uppercase tracking-widest text-accent-foreground/70 font-semibold">
          Saldo
        </p>
        <p className={`font-display text-4xl mt-1 privacy-blur ${stats.saldo >= 0 ? "text-primary" : "text-destructive"}`}>
          {stats.saldo >= 0 ? "+" : ""}{fmtEUR(stats.saldo)}
        </p>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="bg-surface/60 rounded-lg p-2.5 border border-border">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <ArrowDownLeft className="w-3 h-3 text-primary" /> Devem-me
            </p>
            <p className="font-mono text-sm mt-1 text-primary privacy-blur">{fmtEUR(stats.devemTotal)}</p>
          </div>
          <div className="bg-surface/60 rounded-lg p-2.5 border border-border">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-destructive" /> Devo
            </p>
            <p className="font-mono text-sm mt-1 text-destructive privacy-blur">{fmtEUR(stats.devoTotal)}</p>
          </div>
        </div>
        {stats.atrasadas > 0 && (
          <p className="text-[11px] mt-3 flex items-center gap-1.5 text-destructive">
            <AlertCircle className="w-3.5 h-3.5" />
            {stats.atrasadas} {stats.atrasadas === 1 ? "dívida atrasada" : "dívidas atrasadas"}
          </p>
        )}
      </Card>

      {/* Toolbar */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Procurar pessoa, descrição…"
              className="pl-8 h-9 text-sm"
            />
          </div>
          <Button size="sm" className="rounded-xl shrink-0" onClick={() => openNew()}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex gap-2 items-center">
          <Tabs value={view} onValueChange={(v) => setView(v as View)} className="flex-1">
            <TabsList className="w-full h-8">
              <TabsTrigger value="lista" className="flex-1 text-[11px] gap-1">
                <List className="w-3 h-3" /> Lista
              </TabsTrigger>
              <TabsTrigger value="pessoa" className="flex-1 text-[11px] gap-1">
                <Users className="w-3 h-3" /> Pessoa
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-[11px]">
                Filtros
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-[10px] uppercase">Estado</DropdownMenuLabel>
              {(["pendentes", "pagas", "todas"] as StatusFilter[]).map((s) => (
                <DropdownMenuItem key={s} onClick={() => setStatus(s)}>
                  {status === s && <Check className="w-3 h-3 mr-1" />}
                  <span className={status === s ? "" : "ml-4"}>{s[0].toUpperCase() + s.slice(1)}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[10px] uppercase">Direção</DropdownMenuLabel>
              {([["todas","Todas"],["devo","Eu devo"],["devem","Devem-me"]] as const).map(([v, l]) => (
                <DropdownMenuItem key={v} onClick={() => setDir(v)}>
                  {dir === v && <Check className="w-3 h-3 mr-1" />}
                  <span className={dir === v ? "" : "ml-4"}>{l}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[10px] uppercase">Ordenar</DropdownMenuLabel>
              {([["data","Data registo"],["prevista","Data prevista"],["valor","Valor"],["pessoa","Pessoa"]] as const).map(([v, l]) => (
                <DropdownMenuItem key={v} onClick={() => setSort(v)}>
                  {sort === v && <Check className="w-3 h-3 mr-1" />}
                  <span className={sort === v ? "" : "ml-4"}>{l}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Conteúdo */}
      {isLoading ? (
        <div className="py-4 flex justify-center">
          <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-5 text-center bg-surface border-border">
          <p className="text-xs text-muted-foreground">Sem resultados.</p>
        </Card>
      ) : view === "pessoa" ? (
        grouped.map((g) => {
          const saldo = g.devem - g.devo;
          return (
            <Card key={g.pessoa} className="p-3.5 bg-surface border-border space-y-2">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{g.pessoa}</p>
                  <p className="text-[10px] text-muted-foreground">{g.items.length} {g.items.length === 1 ? "registo" : "registos"}</p>
                </div>
                <div className="text-right">
                  <p className={`font-mono text-sm privacy-blur ${saldo >= 0 ? "text-primary" : "text-destructive"}`}>
                    {saldo >= 0 ? "+" : ""}{fmtEUR(saldo)}
                  </p>
                  <p className="text-[10px] text-muted-foreground privacy-blur">
                    <span className="text-primary">+{fmtEUR(g.devem)}</span> · <span className="text-destructive">−{fmtEUR(g.devo)}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-1 pt-1 border-t border-border/50">
                {g.items.map((d) => (
                  <DebtRow key={d.id} d={d}
                    onEdit={() => openEdit(d)}
                    onDel={() => handleDel(d.id)}
                    onToggle={() => handleToggle(d)}
                    onPay={() => openPay(d)}
                    compact
                  />
                ))}
              </div>

              <Button variant="ghost" size="sm" className="h-7 text-[11px] w-full"
                onClick={() => openNew(g.pessoa)}>
                <Plus className="w-3 h-3 mr-1" /> Adicionar para {g.pessoa}
              </Button>
            </Card>
          );
        })
      ) : (
        filtered.map((d) => (
          <DebtRow key={d.id} d={d}
            onEdit={() => openEdit(d)}
            onDel={() => handleDel(d.id)}
            onToggle={() => handleToggle(d)}
            onPay={() => openPay(d)}
          />
        ))
      )}

      <DebtDialog open={debtOpen} onOpenChange={setDebtOpen} debt={editing}
        defaultPessoa={presetPessoa} onSaved={() => refetch()} />

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Registar pagamento</DialogTitle>
          </DialogHeader>
          {payTarget && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                {payTarget.pessoa} · {payTarget.direcao === "devo" ? "Eu devo" : "Devem-me"}
              </p>
              <div className="text-[11px] text-muted-foreground privacy-blur">
                Restante: <span className="font-mono text-foreground">
                  {fmtEUR(Math.max(0, Number(payTarget.valor) - Number(payTarget.valor_pago ?? 0)))}
                </span>
              </div>
              <div className="space-y-1.5">
                <Label>Valor a pagar (€)</Label>
                <Input type="number" inputMode="decimal" step="0.01"
                  value={payValue} onChange={(e) => setPayValue(e.target.value)} autoFocus />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayOpen(false)}>Cancelar</Button>
            <Button onClick={confirmPay}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function DebtRow({
  d, onEdit, onDel, onToggle, onPay, compact,
}: {
  d: FinDebt;
  onEdit: () => void;
  onDel: () => void;
  onToggle: () => void;
  onPay: () => void;
  compact?: boolean;
}) {
  const isDevo = d.direcao === "devo";
  const valor = Number(d.valor);
  const pago = Number(d.valor_pago ?? 0);
  const restante = Math.max(0, valor - pago);
  const pct = valor > 0 ? Math.min(100, (pago / valor) * 100) : 0;
  const hasPartial = pago > 0 && pago < valor;
  const atrasada = !d.pago && d.data_prevista && d.data_prevista < todayISO();

  const content = (
    <>
      <div className="flex items-center gap-3">
        <button onClick={onToggle}
          className={`shrink-0 w-7 h-7 rounded-full border flex items-center justify-center transition-colors ${d.pago ? "bg-primary border-primary text-primary-foreground" : "border-border hover:border-primary"}`}
          title={d.pago ? "Reabrir" : "Marcar paga"}>
          {d.pago ? <Check className="w-3.5 h-3.5" /> : isDevo ? <ArrowUpRight className="w-3.5 h-3.5 text-destructive" /> : <ArrowDownLeft className="w-3.5 h-3.5 text-primary" />}
        </button>
        <button onClick={onEdit} className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-sm font-medium truncate">{d.pessoa}</p>
            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 shrink-0">
              {isDevo ? "devo" : "devem"}
            </Badge>
            {atrasada && (
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 shrink-0 border-destructive/50 text-destructive">
                atrasada
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground truncate">
            {new Date(d.data).toLocaleDateString("pt-PT")}
            {d.data_prevista && (
              <> · <CalendarClock className="w-2.5 h-2.5 inline -mt-0.5" /> {new Date(d.data_prevista).toLocaleDateString("pt-PT")}</>
            )}
            {d.descricao && ` · ${d.descricao}`}
          </p>
        </button>
        <div className="text-right shrink-0">
          <span className={`font-mono text-sm privacy-blur ${isDevo ? "text-destructive" : "text-primary"}`}>
            {isDevo ? "−" : "+"}{fmtEUR(d.pago ? valor : restante)}
          </span>
          {hasPartial && !d.pago && (
            <p className="text-[9px] text-muted-foreground privacy-blur">
              de {fmtEUR(valor)}
            </p>
          )}
        </div>
        <div className="flex items-center -mr-1">
          {!d.pago && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={onPay} title="Registar pagamento">
              <Wallet className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={onDel} title={d.pago ? "Reabrir/eliminar" : "Eliminar"}>
            {d.pago ? <RotateCcw className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>

      {hasPartial && !d.pago && (
        <div className="mt-2">
          <div className="h-1 rounded-full bg-muted/40 overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-[9px] text-muted-foreground mt-0.5 privacy-blur">
            Pago {fmtEUR(pago)} · {pct.toFixed(0)}%
          </p>
        </div>
      )}

      {d.notas && (
        <p className="text-[10px] text-muted-foreground mt-1.5 pl-10 italic line-clamp-2">{d.notas}</p>
      )}
    </>
  );

  if (compact) return <div className="py-1.5">{content}</div>;
  return <Card className="p-3.5 bg-surface border-border">{content}</Card>;
}
