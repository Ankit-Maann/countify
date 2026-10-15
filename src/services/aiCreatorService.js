import { cleanText, normalizeTags } from "../utils/security";
import { supabase, supabaseEnabled } from "./supabase";

const AI_MEMORY_KEY = "countify-ai-memory-v4";
const AI_CHAT_KEY = "countify-ai-chat-v4";
const AI_CONVERSATION_KEY = "countify-ai-conversation-v4";
const DAY_MS = 86400000;

const monthAliases = {
  january: 0, jan: 0, "जनवरी": 0, february: 1, feb: 1, "फरवरी": 1, march: 2, mar: 2, "मार्च": 2,
  april: 3, apr: 3, "अप्रैल": 3, may: 4, "मई": 4, june: 5, jun: 5, "जून": 5,
  july: 6, jul: 6, "जुलाई": 6, august: 7, aug: 7, "अगस्त": 7, september: 8, sep: 8, sept: 8,
  "सितंबर": 8, "सितम्बर": 8, october: 9, oct: 9, "अक्टूबर": 9, november: 10, nov: 10, "नवंबर": 10,
  "नवम्बर": 10, december: 11, dec: 11, "दिसंबर": 11, "दिसम्बर": 11,
};
const monthPattern = Object.keys(monthAliases).sort((a, b) => b.length - a.length).map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");

function cleanPrompt(text) {
  return cleanText(String(text ?? "").normalize("NFKC"), 1200).replace(/[“”]/g, '"').replace(/[‘’]/g, "'").trim();
}
function futureDate(date) { return date instanceof Date && !Number.isNaN(date.getTime()) && date.getTime() > Date.now() ? date : null; }
function validDate(year, month, day, hour = 0, minute = 0) {
  const date = new Date(year, month, day, hour, minute, 0, 0);
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) return null;
  return futureDate(date);
}
function parseTime(text) {
  const m = String(text).match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i);
  if (!m) return { hour: 0, minute: 0, found: false };
  let hour = Number(m[1]); const minute = Number(m[2] || 0); const ap = m[3]?.toLowerCase();
  if (minute > 59 || hour > 23 || (ap && hour > 12)) return { hour: 0, minute: 0, found: false };
  if (ap === "pm" && hour < 12) hour += 12; if (ap === "am" && hour === 12) hour = 0;
  return { hour, minute, found: true };
}

export function parseNaturalDate(text, referenceDate = new Date()) {
  const value = cleanPrompt(text).toLowerCase().replace(/,/g, " ").replace(/\s+/g, " ");
  const now = new Date(referenceDate);
  const explicitNextYear = /\bnext\s+year\b|अगले\s+साल|अगले\s+वर्ष/i.test(value);
  const time = parseTime(value);
  const make = (y, m, d) => validDate(y, m, d, time.hour, time.minute);

  const iso = value.match(/\b(20\d{2})-(\d{1,2})-(\d{1,2})(?:[t ](\d{1,2}):(\d{2}))?\b/);
  if (iso) return validDate(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]), Number(iso[4] || 0), Number(iso[5] || 0));
  const slash = value.match(/\b(\d{1,2})[/-](\d{1,2})[/-](20\d{2})\b/);
  if (slash) return make(Number(slash[3]), Number(slash[2]) - 1, Number(slash[1]));
  if (/\b(day after tomorrow|परसों)\b/i.test(value)) return futureDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, time.hour, time.minute));
  if (/\b(tomorrow|कल)\b/i.test(value)) return futureDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, time.hour, time.minute));
  if (/\b(today|आज)\b/i.test(value)) return futureDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, time.hour, time.minute));
  const weekdays = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
  const weekday = value.match(/\b(?:next\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/);
  if (weekday) { const target = weekdays[weekday[1]]; const delta = ((target - now.getDay() + 7) % 7) || 7; return futureDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + delta, time.hour, time.minute)); }
  if (/\bnext\s+week\b/.test(value)) return futureDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, time.hour, time.minute));
  if (/\bnext\s+month\b/.test(value)) return futureDate(new Date(now.getFullYear(), now.getMonth() + 1, now.getDate(), time.hour, time.minute));
  const dayMonth = value.match(new RegExp(`(?:^|\\s)(\\d{1,2})(?:st|nd|rd|th)?\\s+(${monthPattern})(?:\\s+(20\\d{2}))?(?=\\s|$)`, "iu"));
  if (dayMonth) {
    const day = Number(dayMonth[1]); const month = monthAliases[dayMonth[2].toLowerCase()]; let year = dayMonth[3] ? Number(dayMonth[3]) : (explicitNextYear ? now.getFullYear() + 1 : now.getFullYear());
    let date = make(year, month, day); if (!dayMonth[3] && !explicitNextYear && !date) date = make(year + 1, month, day); if (date) return date;
  }
  const monthDay = value.match(new RegExp(`(?:^|\\s)(${monthPattern})\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:\\s+(20\\d{2}))?(?=\\s|$)`, "iu"));
  if (monthDay) {
    const month = monthAliases[monthDay[1].toLowerCase()]; const day = Number(monthDay[2]); let year = monthDay[3] ? Number(monthDay[3]) : (explicitNextYear ? now.getFullYear() + 1 : now.getFullYear());
    let date = make(year, month, day); if (!monthDay[3] && !explicitNextYear && !date) date = make(year + 1, month, day); if (date) return date;
  }
  const known = [[/\bchristmas\b|क्रिसमस/i, 11, 25], [/\bnew\s*year\b|नया\s+साल/i, 0, 1]];
  for (const [pattern, month, day] of known) if (pattern.test(value)) { let y = now.getFullYear(); let d = make(y, month, day); if (!d) d = make(y + 1, month, day); if (d) return d; }
  return null;
}

function inferName(text) {
  const patterns = [
    [/(?:sister|sis|behen|बहन).*(?:wedding\s+)?anniversary|(?:wedding\s+)?anniversary.*(?:sister|sis|behen|बहन)/i, "My Sister's Wedding Anniversary"],
    [/(?:brother|bhai|भाई).*(?:wedding\s+)?anniversary|(?:wedding\s+)?anniversary.*(?:brother|bhai|भाई)/i, "My Brother's Wedding Anniversary"],
    [/(?:mom|mummy|mother|maa|मम्मी|माँ).*(?:birthday)|birthday.*(?:mom|mummy|mother|maa|मम्मी|माँ)/i, "Mum's Birthday"],
    [/(?:dad|papa|father|पापा|पिताजी).*(?:birthday)|birthday.*(?:dad|papa|father|पापा|पिताजी)/i, "Dad's Birthday"],
    [/\bbirthday\b|जन्मदिन/i, "Birthday"], [/\bexam\b|परीक्षा|एग्जाम/i, "Exam Day"], [/\bdiwali\b|दिवाली/i, "Diwali"],
    [/\bchristmas\b|क्रिसमस/i, "Christmas"], [/\bwedding\b|शादी|विवाह/i, "Wedding"], [/\btrip\b|vacation|यात्रा/i, "Trip"],
    [/\bholiday\b|छुट्टी/i, "Holiday"], [/\bnew\s*year\b|नया साल/i, "New Year"], [/\banniversary\b|सालगिरह|वर्षगांठ/i, "Anniversary"],
  ];
  for (const [re, name] of patterns) if (re.test(text)) return name;
  const quoted = text.match(/["'](.+?)["']/); return quoted ? cleanText(quoted[1], 80) : "My Countdown";
}
function inferIcon(name, text) { const v = `${name} ${text}`.toLowerCase(); if (/birthday|जन्मदिन/.test(v)) return "🎂"; if (/exam|परीक्षा/.test(v)) return "📚"; if (/diwali|दिवाली/.test(v)) return "🪔"; if (/christmas|क्रिसमस/.test(v)) return "🎄"; if (/wedding|शादी/.test(v)) return "💍"; if (/trip|vacation|यात्रा/.test(v)) return "✈️"; if (/new year|नया साल/.test(v)) return "🎆"; if (/anniversary|सालगिरह/.test(v)) return "💖"; return "✨"; }
function inferTheme(name, text) { const v = `${name} ${text}`.toLowerCase(); if (/diwali|दिवाली/.test(v)) return { theme: "diwali", accent: "#f59e0b" }; if (/christmas|क्रिसमस/.test(v)) return { theme: "christmas", accent: "#22c55e" }; if (/birthday|wedding|anniversary|सालगिरह/.test(v)) return { theme: "candy", accent: "#fb7185" }; if (/exam|परीक्षा/.test(v)) return { theme: "midnight", accent: "#a78bfa" }; if (/trip|vacation|यात्रा/.test(v)) return { theme: "ocean", accent: "#06b6d4" }; return { theme: "default", accent: "#22d3ee" }; }

export function buildCountdownResult(prompt, date, extra = {}) {
  const name = cleanText(extra.name || inferName(prompt), 80); const visual = inferTheme(name, prompt);
  return {
    name, date: date.toISOString().slice(0, 16), time: extra.time || `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`,
    icon: extra.icon || inferIcon(name, prompt), description: cleanText(extra.description || `${name} is almost here! ✨`, 180),
    accent: extra.accent || visual.accent, theme: extra.theme || visual.theme, imageUrl: extra.imageUrl || "",
    tags: normalizeTags([name.toLowerCase(), "countdown", "created-with-ai", ...(extra.tags || [])]), aiPrompt: prompt,
  };
}

export function generateCountdownFromPrompt(prompt) {
  const text = cleanPrompt(prompt); if (!text) throw new Error("Tell me what you are counting down to.");
  const date = parseNaturalDate(text); if (!date) throw new Error("I couldn't confidently find a future date. Tell me the date naturally — for example, ‘meri sister ki anniversary 12 november 2026 ko hai’.");
  return buildCountdownResult(text, date);
}

function readMemory() { try { return JSON.parse(localStorage.getItem(AI_MEMORY_KEY) || "{}"); } catch { return {}; } }
function writeMemory(memory) { try { localStorage.setItem(AI_MEMORY_KEY, JSON.stringify(memory)); } catch { /* storage is optional */ } }
export function getAiMemory() { return readMemory(); }
export function saveAiMemory(patch) { const next = { ...readMemory(), ...patch }; writeMemory(next); return next; }
export function clearAiMemory() { try { localStorage.removeItem(AI_MEMORY_KEY); localStorage.removeItem(AI_CHAT_KEY); localStorage.removeItem(AI_CONVERSATION_KEY); } catch { /* optional */ } }
export function loadAiChat() { try { const value = JSON.parse(localStorage.getItem(AI_CHAT_KEY) || "[]"); return Array.isArray(value) ? value.slice(-80) : []; } catch { return []; } }
export function saveAiChat(messages) { try { localStorage.setItem(AI_CHAT_KEY, JSON.stringify(messages.slice(-80))); } catch { /* optional */ } }

function normalizeAiResult(raw, prompt) {
  const source = raw?.result || raw || {}; const parsedDate = source.date ? parseNaturalDate(String(source.date)) : parseNaturalDate(prompt);
  return parsedDate ? buildCountdownResult(prompt, parsedDate, source) : null;
}

export async function createWithAi(prompt, history = [], context = {}) {
  const endpoint = import.meta.env.VITE_AI_ENDPOINT; const cleaned = cleanPrompt(prompt);
  if (!cleaned) throw new Error("Tell me what you want to create or change.");
  if (!endpoint) return { source: "local-smart-parser", result: generateCountdownFromPrompt(cleaned), reply: "I understood the event locally. Connect the AI endpoint for full conversational copilot features." };
  const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: cleaned, history: history.slice(-20), context: { ...context, memory: readMemory() } }) });
  const payload = await response.json().catch(() => null); if (!response.ok) throw new Error(payload?.error || "AI service is temporarily unavailable.");
  const result = normalizeAiResult(payload.result, cleaned);
  return { ...payload, source: "ai-endpoint", result };
}

async function getCloudUser() {
  if (!supabaseEnabled) return null;
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}

export async function persistAiConversationMessage(message, metadata = {}) {
  const user = await getCloudUser();
  if (!user) return null;
  let conversationId = null;
  try { conversationId = localStorage.getItem(AI_CONVERSATION_KEY); } catch { /* optional */ }
  if (!conversationId) {
    const { data, error } = await supabase.from("ai_conversations").insert({ user_id: user.id, title: metadata.title || "Countify AI session", metadata }).select("id").single();
    if (error || !data?.id) return null;
    conversationId = data.id;
    try { localStorage.setItem(AI_CONVERSATION_KEY, conversationId); } catch { /* optional */ }
  }
  const { error } = await supabase.from("ai_messages").insert({ conversation_id: conversationId, user_id: user.id, role: message.role, content: String(message.text || "").slice(0, 4000), metadata: message.metadata || {} });
  return error ? null : conversationId;
}

export async function persistAiConversation(messages, metadata = {}) {
  let id = null;
  for (const message of messages.slice(-40)) id = await persistAiConversationMessage(message, metadata) || id;
  return id;
}

export const AI_CAPABILITIES = [
  "natural-language-understanding", "conversation-memory", "tool-actions", "date-context", "visual-design", "multilingual", "voice-input", "countdown-copilot",
];
