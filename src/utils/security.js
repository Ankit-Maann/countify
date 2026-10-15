export const LIMITS = {
  name: 60,
  description: 160,
  slug: 48,
  icon: 8,
  imageUrl: 500,
  tags: 8,
};

export function cleanText(value, max = 120) {
  return Array.from(String(value ?? "")).filter((char) => { const code = char.charCodeAt(0); return code >= 32 && code !== 127; }).join("").trim().slice(0, max);
}

export function cleanSlug(value) {
  return cleanText(value, LIMITS.slug).toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "countdown";
}

export function isValidDate(value) {
  const d = new Date(value);
  return Number.isFinite(d.getTime()) && d.getTime() > Date.now();
}

export function isSafeImageUrl(value) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol);
  } catch {
    return false;
  }
}

export function normalizeTags(tags) {
  const source = Array.isArray(tags) ? tags : String(tags || "").split(",");
  return [...new Set(source.map((tag) => cleanSlug(tag)).filter(Boolean))].slice(0, LIMITS.tags);
}

export function validateCountdown(input) {
  const name = cleanText(input?.name, LIMITS.name);
  const description = cleanText(input?.description, LIMITS.description);
  if (!name) throw new Error("Countdown name is required.");
  if (!isValidDate(input?.date)) throw new Error("Please choose a valid future date and time.");
  if (!isSafeImageUrl(input?.imageUrl)) throw new Error("Image URL must use http or https.");
  const design = input?.design && typeof input.design === "object" ? {
    font: ["sans", "serif", "mono", "display"].includes(input.design.font) ? input.design.font : "sans",
    layout: ["center", "split"].includes(input.design.layout) ? input.design.layout : "center",
    radius: Math.min(40, Math.max(8, Number(input.design.radius) || 24)),
    opacity: Math.min(85, Math.max(20, Number(input.design.opacity) || 58)),
    overlay: Math.min(80, Math.max(0, Number(input.design.overlay) || 35)),
    animation: input.design.animation === "off" ? "off" : "on",
    backgroundImage: cleanText(input.design.backgroundImage, 500),
  } : null;
  if (design?.backgroundImage && !isSafeImageUrl(design.backgroundImage)) throw new Error("Background image URL must use http or https.");
  return {
    ...input,
    name,
    description,
    icon: cleanText(input?.icon || "🎉", LIMITS.icon),
    imageUrl: cleanText(input?.imageUrl, LIMITS.imageUrl),
    tags: normalizeTags(input?.tags),
    design,
    accent: /^#[0-9a-f]{6}$/i.test(input?.accent || "") ? input.accent : "#22d3ee",
  };
}

export function safeJsonParse(raw, fallback) {
  try { return JSON.parse(raw); } catch { return fallback; }
}
