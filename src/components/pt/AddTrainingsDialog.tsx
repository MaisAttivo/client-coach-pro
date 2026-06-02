import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateClient, type PtClient } from "@/lib/pt-clients";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  client: PtClient | null;
  onDone?: () => void;
}

export function AddTrainingsDialog({ open, onOpenChange, client, onDone }: Props) {
  const defaultAdd = client ? Math.max(0, Number(client.frequencia_semanal ?? 0)) * 4 : 0;
  const [add, setAdd] = useState<string>(String(defaultAdd));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && client) {
      setAdd(String(Math.max(0, Number(client.frequencia_semanal ?? 0)) * 4));
    }
  }, [open, client]);

  if (!client) return null;

  const saldoAtual = Number(client.treinos_pagos ?? 0) - Number(client.treinos_dados ?? 0);
  const delta = Math.max(0, Math.trunc(Number(add.replace(",", ".")) || 0));
  const novoSaldo = saldoAtual + delta;

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await updateClient(client.id, {
        treinos_pagos: Number(client.treinos_pagos ?? 0) + delta,
      });
      toast.success(`+${delta} treinos adicionados`);
      onDone?.();
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro");
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm bg-surface border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-center">
            Adicionar treinos ao saldo?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm">
            Adicionar <span className="font-bold text-primary">+{delta} treinos</span> ao saldo de{" "}
            <span className="font-bold">{client.nome}</span>?
          </p>

          <div className="rounded-xl bg-muted/50 p-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Saldo atual</span>
              <span className="font-mono">{saldoAtual}</span>
            </div>
            <div className="flex justify-between items-center border-t border-border/60 pt-1.5">
              <Label htmlFor="add-trainings" className="text-muted-foreground text-sm">A adicionar</Label>
              <Input
                id="add-trainings"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                value={add}
                onChange={(e) => setAdd(e.target.value)}
                className="h-8 w-20 text-right font-mono text-primary"
              />
            </div>
            <div className="flex justify-between font-semibold border-t border-border/60 pt-1.5">
              <span>Novo saldo</span>
              <span className="font-mono">{novoSaldo}</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Cancela se for uma correção/pagamento extra que não deve somar treinos.
          </p>
        </div>

        <DialogFooter>
          <div className="flex gap-2 w-full">
            <Button variant="outline" onClick={handleSkip} disabled={saving} className="flex-1">
              Não somar
            </Button>
            <Button onClick={handleConfirm} disabled={saving || delta <= 0} className="flex-1">
              {saving ? "…" : "Sim, adicionar"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
