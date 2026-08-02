import { supabase } from "@/integrations/supabase/client";
import { buildMcuCatalog } from "./mcu-catalog";

export type McuItem = {
  id: string;
  user_id: string;
  kind: "filme" | "episodio";
  title: string;
  series: string | null;
  season: number | null;
  episode: number | null;
  year: number | null;
  runtime_min: number;
  phase: string | null;
  order_index: number;
  watched: boolean;
  watched_at: string | null;
};

export async function listMcuItems(): Promise<McuItem[]> {
  const { data, error } = await supabase
    .from("mcu_items")
    .select("*")
    .order("order_index", { ascending: true });
  if (error) throw error;
  return (data ?? []) as McuItem[];
}

export async function seedMcu(userId: string): Promise<number> {
  const rows = buildMcuCatalog().map((c) => ({ ...c, user_id: userId, watched: false }));
  let inserted = 0;
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);
    const { error, count } = await supabase
      .from("mcu_items")
      .insert(chunk, { count: "exact" });
    if (error) throw error;
    inserted += count ?? chunk.length;
  }
  return inserted;
}

export async function setWatched(id: string, watched: boolean) {
  const { error } = await supabase
    .from("mcu_items")
    .update({ watched, watched_at: watched ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) throw error;
}

export async function setWatchedBulk(ids: string[], watched: boolean) {
  if (!ids.length) return;
  const { error } = await supabase
    .from("mcu_items")
    .update({ watched, watched_at: watched ? new Date().toISOString() : null })
    .in("id", ids);
  if (error) throw error;
}

export async function resetMcu(userId: string) {
  const { error } = await supabase.from("mcu_items").delete().eq("user_id", userId);
  if (error) throw error;
}
