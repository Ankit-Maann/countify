import { supabase, supabaseEnabled } from "./supabase";
import { cleanSlug, cleanText, normalizeTags, validateCountdown } from "../utils/security";

const clean = (event) => {
  const valid = validateCountdown({ ...event, date: event.date });
  return {
    name: valid.name,
    description: valid.description,
    date: new Date(valid.date).toISOString(),
    icon: valid.icon,
    theme: cleanText(valid.theme || "default", 30),
    accent: valid.accent,
    image_url: valid.imageUrl || null,
    tags: normalizeTags(valid.tags),
    design: valid.design || null,
  };
};

export function makeSlug(name, id = "") {
  const base = cleanSlug(name).slice(0, 38) || "countdown";
  const suffix = String(id || crypto.randomUUID()).replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toLowerCase();
  return `${base}-${suffix}`;
}

export async function getSession() {
  if (!supabaseEnabled) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data?.session || null;
}

export function onAuthChange(callback) {
  if (!supabaseEnabled) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data?.subscription?.unsubscribe?.();
}

export async function signIn(email, password) {
  if (!supabaseEnabled) throw new Error("Cloud is not configured yet.");
  return supabase.auth.signInWithPassword({ email: cleanText(email, 160), password });
}
export async function signUp(email, password) {
  if (!supabaseEnabled) throw new Error("Cloud is not configured yet.");
  if (String(password).length < 8) throw new Error("Use a password with at least 8 characters.");
  return supabase.auth.signUp({ email: cleanText(email, 160), password });
}
export async function signOut() { if (supabaseEnabled) await supabase.auth.signOut(); }

export async function publishCountdown(event, { isPublic = true } = {}) {
  if (!supabaseEnabled) return { cloud: false, event: null };
  const session = await getSession();
  if (!session?.user) throw new Error("Please sign in before publishing to the cloud.");
  const id = event.cloudId || crypto.randomUUID();
  const slug = event.slug || makeSlug(event.name, id);
  const payload = { id, owner_id: session.user.id, slug, ...clean(event), is_public: Boolean(isPublic) };
  const { data, error } = await supabase.from("countdowns").upsert(payload, { onConflict: "id" }).select().single();
  if (error) throw error;
  return { cloud: true, event: data };
}

export async function getPublicCountdown(slug) {
  if (!supabaseEnabled) return null;
  const safe = cleanSlug(slug);
  const { data, error } = await supabase.from("countdowns").select("*").eq("slug", safe).eq("is_public", true).maybeSingle();
  if (error) throw error;
  return data || null;
}

export async function getMyCountdowns() {
  if (!supabaseEnabled) return [];
  const session = await getSession(); if (!session?.user) return [];
  const { data, error } = await supabase.from("countdowns").select("*").eq("owner_id", session.user.id).order("created_at", { ascending: false });
  if (error) throw error; return data || [];
}
export async function setCountdownVisibility(id, isPublic) {
  if (!supabaseEnabled) return;
  const session = await getSession(); if (!session?.user) throw new Error("Sign in required.");
  const { error } = await supabase.from("countdowns").update({ is_public: Boolean(isPublic) }).eq("id", id).eq("owner_id", session.user.id);
  if (error) throw error;
}
export async function deleteCloudCountdown(id) {
  if (!supabaseEnabled) return;
  const session = await getSession(); if (!session?.user) throw new Error("Sign in required.");
  const { error } = await supabase.from("countdowns").delete().eq("id", id).eq("owner_id", session.user.id);
  if (error) throw error;
}

function visitorKey() {
  try { return crypto.randomUUID(); } catch { return `${Date.now()}-${Math.random().toString(36).slice(2)}`; }
}
export function getVisitorId() {
  const key = "countdown-visitor-id";
  try { let id = localStorage.getItem(key); if (!id) { id = visitorKey(); localStorage.setItem(key, id); } return id; } catch { return null; }
}

export async function trackAnalytics({ countdownId, eventType = "view", visitorId = getVisitorId() }) {
  if (!supabaseEnabled || !countdownId || !["view", "share", "qr_scan"].includes(eventType)) return;
  const { error } = await supabase.rpc("record_countdown_event", {
    p_countdown_id: countdownId,
    p_event_type: eventType,
    p_visitor_id: visitorId,
    p_referrer: typeof document !== "undefined" ? document.referrer.slice(0, 500) : null,
  });
  if (error) console.debug("Analytics skipped:", error.message);
}

export async function getAnalytics(countdownIds) {
  if (!supabaseEnabled || !countdownIds?.length) return [];
  const { data, error } = await supabase.from("countdown_analytics").select("countdown_id,event_type,visitor_id,created_at").in("countdown_id", countdownIds).order("created_at", { ascending: false }).limit(5000);
  if (error) throw error; return data || [];
}
