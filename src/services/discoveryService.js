import { supabase, supabaseEnabled } from "./supabase";

export async function discoverCountdowns({ search = "", tag = "", limit = 30 } = {}) {
  if (!supabaseEnabled) return [];
  let query = supabase.from("countdowns")
    .select("id,slug,name,description,date,icon,theme,accent,image_url,tags,views_count,created_at")
    .eq("is_public", true)
    .order("views_count", { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 60));
  if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  if (tag) query = query.contains("tags", [tag]);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}
