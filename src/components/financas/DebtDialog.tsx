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
  defaultPessoa?: string;
}

export function DebtDialog({ open, onOpenChange, debt, onSaved, defaultPessoa }: Props) {
  const [direcao, setDirecao] = useState<Direcao>("devo");
  const [pessoa, setPessoa] = useState("");
  const [valor, setValor] = useState("");
  const [valorPago, setValorPago] = useState("");
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [dataPrevista, setDataPrevista] = useState("");
  const [notas, setNotas] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (debt) {
      setDirecao(debt.direcao as Direcao);
      setPessoa(debt.pessoa);
      setValor(String(debt.valor));
      setValorPago(debt.valor_pago ? String(debt.valor_pago) : "");
      setDescricao(debt.descricao ?? "");
      setData(debt.data);
      setDataPrevista(debt.data_prevista ?? "");
      setNotas(debt.notas ?? "");
    } else {
      setDirecao("devo");
      setPessoa(defaultPessoa ?? "");
      setValor("");
      setValorPago("");
      setDescricao("");
      setData(new Date().toISOString().slice(0, 10));
      setDataPrevista("");
      setNotas("");
    }
  }, [open, debt, defaultPessoa]);

  const restante = Math.max(0, Number(valor || 0) - Number(valorPago || 0));

  const save = async () => {
    if (!pessoa.trim() || !valor) {
      toast.error("Preenche pessoa e valor");
      return;
    }
    setSaving(true);
    try {
      const vp = Number(valorPago || 0);
      const v = Number(valor);
      const totalPago = vp >= v && v > 0;
      const payload = {
        pessoa: pessoa.trim(),
        direcao,
        valor: v,
        valor_pago: vp,
        descricao: descricao.trim() || null,
        data,
        data_prevista: dataPrevista || null,
        notas: notas.trim() || null,
        pago: totalPago,
        data_pago: totalPago ? (debt?.data_pago ?? new Date().toISOString().slice(0, 10)) : null,
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
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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
              <Label>Valor total (€)</Label>
              <Input type="number" inputMode="decimal" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Já pago (€)</Label>
              <Input type="number" inputMode="decimal" step="0.01" value={valorPago} onChange={(e) => setValorPago(e.target.value)} placeholder="0" />
            </div>
          </div>
          {Number(valorPago || 0) > 0 && (
            <p className="text-[11px] text-muted-foreground -mt-2">
              Restante: <span className="font-mono text-foreground">{restante.toFixed(2)} €</span>
              {restante === 0 && " · será marcada como paga"}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Data</Label>
              <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Prevista</Label>
              <Input type="date" value={dataPrevista} onChange={(e) => setDataPrevista(e.target.value)} />
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
