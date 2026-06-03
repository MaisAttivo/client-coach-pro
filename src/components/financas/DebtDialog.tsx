import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { createDebt, updateDebt, type FinDebt, type Direcao } from "@/lib/fin-debts";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  debt: FinDebt | null;
  onSaved: () => void;
}

export function DebtDialog({ open, onOpenChange, debt, onSaved }: Props) {
  const [direcao, setDirecao] = useState<Direcao>("devo");
  const [pessoa, setPessoa] = useState("");
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [notas, setNotas] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (debt) {
      setDirecao(debt.direcao as Direcao);
      setPessoa(debt.pessoa);
      setValor(String(debt.valor));
      setDescricao(debt.descricao ?? "");
      setData(debt.data);
      setNotas(debt.notas ?? "");
    } else {
      setDirecao("devo");
      setPessoa("");
      setValor("");
      setDescricao("");
      setData(new Date().toISOString().slice(0, 10));
      setNotas("");
    }
  }, [open, debt]);

  const save = async () => {
    if (!pessoa.trim() || !valor) {
      toast.error("Preenche pessoa e valor");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        pessoa: pessoa.trim(),
        direcao,
        valor: Number(valor),
        descricao: descricao.trim() || null,
        data,
        notas: notas.trim() || null,
      };
      if (debt) await updateDebt(debt.id, payload);
      else await createDebt(payload);
      toast.success("Guardado");
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{debt ? "Editar dívida" : "Nova dívida"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Tabs value={direcao} onValueChange={(v) => setDirecao(v as Direcao)}>
            <TabsList className="w-full">
              <TabsTrigger value="devo" className="flex-1">Eu devo</TabsTrigger>
              <TabsTrigger value="devem" className="flex-1">Devem-me</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-1.5">
            <Label>Pessoa</Label>
            <Input value={pessoa} onChange={(e) => setPessoa(e.target.value)} placeholder="Nome" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Valor (€)</Label>
              <Input type="number" inputMode="decimal" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Data</Label>
              <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex: jantar, empréstimo…" />
          </div>

          <div className="space-y-1.5">
            <Label>Notas</Label>
            <Textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={2} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={save} disabled={saving}>{saving ? "A guardar…" : "Guardar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
