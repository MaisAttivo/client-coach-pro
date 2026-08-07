import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { createTransaction, deleteTransaction, type FinTransaction } from "@/lib/fin-transactions";
import { valorMensalEfetivo, type FinFixed } from "@/lib/fin-fixed";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  fixa: FinFixed | null;
  ym: string;
  existing: FinTransaction | null;
  onSaved: () => void;
}

export function FixedPaymentDialog({ open, onOpenChange, fixa, ym, existing, onSaved }: Props) {
  const [valor, setValor] = useState("");
  const [data, setData] = useState("");
  const [notas, setNotas] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !fixa) return;
    if (existing) {
      setValor(String(existing.valor));
      setData(existing.data);
      setNotas(existing.notas ?? "");
    } else {
      setValor(valorMensalEfetivo(fixa).toFixed(2));
      const day = fixa.dia_pagamento ?? 1;
      const [y, m] = ym.split("-").map(Number);
      const dd = String(Math.min(day, 28)).padStart(2, "0");
      setData(`${y}-${String(m).padStart(2, "0")}-${dd}`);
      setNotas("");
    }
  }, [open, fixa, existing, ym]);

  if (!fixa) return null;

  const save = async () => {
    const v = Number(String(valor).replace(",", "."));
    if (!(v > 0)) { toast.error("Valor inválido"); return; }
    setSaving(true);
    try {
      if (existing) {
        const { error } = await supabase
          .from("fin_transactions")
          .update({ valor: v, data, notas: notas.trim() || null })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        await createTransaction({
          tipo: "despesa",
          mes_referencia: ym,
          data,
          valor: v,
          descricao: fixa.nome,
          notas: notas.trim() || null,
          categoria_id: fixa.categoria_id ?? null,
          fixed_expense_id: fixa.id,
          origem: "fixa_gerada",
        });
      }
      toast.success("Pagamento registado");
      onSaved();
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!existing) return;
    if (!confirm("Marcar como não paga neste mês?")) return;
    setSaving(true);
    try {
      await deleteTransaction(existing.id);
      toast.success("Removido");
      onSaved();
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{existing ? "Editar pagamento" : "Marcar como paga"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-sm font-medium">{fixa.nome}</p>
            <p className="text-[10px] text-muted-foreground">
              {ym} · valor previsto {valorMensalEfetivo(fixa).toFixed(2)} €
            </p>
          </div>

          <div>
            <Label className="text-xs">Valor pago neste mês (€)</Label>
            <Input type="number" inputMode="decimal" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} />
            <p className="text-[10px] text-muted-foreground mt-1">
              Alterar aqui só afeta este mês.
            </p>
          </div>
          <div>
            <Label className="text-xs">Data</Label>
            <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Notas</Label>
            <Input value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Opcional" />
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between gap-2">
          {existing ? (
            <Button variant="ghost" className="text-destructive" onClick={remove} disabled={saving}>
              Não paga
            </Button>
          ) : <span />}
          <Button onClick={save} disabled={saving}>{saving ? "A guardar…" : "Guardar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
