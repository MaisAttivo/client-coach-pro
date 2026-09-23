import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
export type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"];

export const SISTEMAS = [
  { id: "geral", label: "Geral" },
  { id: "pt", label: "PT Manager" },
  { id: "financas", label: "Finanças" },
  { id: "imobiliario", label: "Imobiliário" },
  { id: "jogos", label: "Jogos" },
  { id: "pessoal", label: "Pessoal" },
] as const;

export const PRIORIDADES = [
  { value: 0, label: "Baixa" },
  { value: 1, label: "Normal" },
  { value: 2, label: "Alta" },
] as const;

export function sistemaLabel(id: string) {
  return SISTEMAS.find((s) => s.id === id)?.label ?? id;
}

export async function listTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("done", { ascending: true })
    .order("prioridade", { ascending: false })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createTask(input: Omit<TaskInsert, "owner_id">) {
  const { data: u } = await supabase.auth.getUser();
  const uid = u.user?.id;
  if (!uid) throw new Error("Não autenticado");
  const { data, error } = await supabase
    .from("tasks")
    .insert({ ...input, owner_id: uid })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTask(id: string, patch: TaskUpdate) {
  const { data, error } = await supabase
    .from("tasks")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function toggleTask(id: string, done: boolean) {
  return updateTask(id, { done, done_at: done ? new Date().toISOString() : null });
}

export async function deleteTask(id: string) {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
}

export async function clearDone() {
  const { error } = await supabase.from("tasks").delete().eq("done", true);
  if (error) throw error;
}
