import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type FinDebt = Database["public"]["Tables"]["fin_debts"]["Row"];
export type FinDebtInsert = Database["public"]["Tables"]["fin_debts"]["Insert"];
export type FinDebtUpdate = Database["public"]["Tables"]["fin_debts"]["Update"];

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
  return data ?? [];
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

export async function togglePago(id: string, pago: boolean) {
  return updateDebt(id, { pago, data_pago: pago ? new Date().toISOString().slice(0, 10) : null });
}
