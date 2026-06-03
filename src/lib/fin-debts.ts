import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type FinDebt = Database["public"]["Tables"]["fin_debts"]["Row"] & {
  valor_pago?: number;
  data_prevista?: string | null;
};
export type FinDebtInsert = Database["public"]["Tables"]["fin_debts"]["Insert"] & {
  valor_pago?: number;
  data_prevista?: string | null;
};
export type FinDebtUpdate = Database["public"]["Tables"]["fin_debts"]["Update"] & {
  valor_pago?: number;
  data_prevista?: string | null;
};

export type Direcao = "devo" | "devem";

export const DIRECAO_LABEL: Record<Direcao, string> = {
  devo: "Devo",
  devem: "Devem-me",
};

export async function listDebts(): Promise<FinDebt[]> {
  const { data, error } = await supabase
    .from("fin_debts")
    .select("*")
    .order("pago", { ascending: true })
    .order("data", { ascending: false });
  if (error) throw error;
  return (data ?? []) as FinDebt[];
}

export async function createDebt(input: Omit<FinDebtInsert, "owner_id">) {
  const { data: u } = await supabase.auth.getUser();
  const uid = u.user?.id;
  if (!uid) throw new Error("Não autenticado");
  const { data, error } = await supabase
    .from("fin_debts")
    .insert({ ...input, owner_id: uid })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateDebt(id: string, patch: FinDebtUpdate) {
  const { data, error } = await supabase
    .from("fin_debts")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteDebt(id: string) {
  const { error } = await supabase.from("fin_debts").delete().eq("id", id);
  if (error) throw error;
}

export async function togglePago(id: string, pago: boolean, valorTotal?: number) {
  const patch: FinDebtUpdate = {
    pago,
    data_pago: pago ? new Date().toISOString().slice(0, 10) : null,
  };
  if (pago && typeof valorTotal === "number") patch.valor_pago = valorTotal;
  if (!pago) patch.valor_pago = 0;
  return updateDebt(id, patch);
}

export async function addPartialPayment(d: FinDebt, amount: number) {
  const novoPago = Math.min(Number(d.valor), Number(d.valor_pago ?? 0) + amount);
  const totalPago = novoPago >= Number(d.valor);
  return updateDebt(d.id, {
    valor_pago: novoPago,
    pago: totalPago,
    data_pago: totalPago ? new Date().toISOString().slice(0, 10) : null,
  });
}
