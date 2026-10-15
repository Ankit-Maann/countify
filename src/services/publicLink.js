import { encodeCustomEvent } from "../utils/countdown";

export function localPublicLink(event) {
  const token = event.shareToken || encodeCustomEvent(event);
  const slug = `${encodeURIComponent(event.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 36) || "countdown")}-${token.slice(0, 10)}`;
  return `${window.location.origin}/c/${slug}?data=${encodeURIComponent(token)}`;
}

export function publicLink(event) {
  if (event?.slug && event?.cloudId) return `${window.location.origin}/c/${encodeURIComponent(event.slug)}`;
  return localPublicLink(event);
}

export function visitorId() {
  const key = "countdown-visitor-id";
  try {
    let id = localStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return null;
  }
}
