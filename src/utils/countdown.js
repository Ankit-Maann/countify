export function eventTime(event) {
  return new Date(event.date).getTime();
}

export function isValidEvent(event) {
  return Boolean(
    event &&
      typeof event.id === "string" &&
      typeof event.name === "string" &&
      typeof event.date === "string" &&
      !Number.isNaN(eventTime(event))
  );
}

export function isStarted(event, now = Date.now()) {
  return eventTime(event) <= now;
}

export function formatEventDate(date) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatEventDateTime(date) {
  return new Date(date).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function getUpcoming(events, now = Date.now()) {
  return events
    .filter((event) => eventTime(event) > now)
    .sort((a, b) => eventTime(a) - eventTime(b));
}

export function getNextEvent(events, now = Date.now()) {
  return getUpcoming(events, now)[0] ?? null;
}

export function getCountdownParts(target, now = Date.now()) {
  const difference = target - now;

  if (difference <= 0) {
    return { difference: 0, days: 0, hours: 0, minutes: 0, seconds: 0, started: true };
  }

  const totalSeconds = Math.floor(difference / 1000);

  return {
    difference,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    started: false,
  };
}

export function pad2(value) {
  return String(value).padStart(2, "0");
}

export function buildBackground(settings) {
  const colors = settings.colors;
  if (settings.type === "radial") {
    return `radial-gradient(circle at 30% 20%, ${colors[2]} 0%, ${colors[1]} 48%, ${colors[0]} 100%)`;
  }
  return `linear-gradient(${settings.angle}deg, ${colors[0]} 0%, ${colors[1]} 52%, ${colors[2]} 100%)`;
}

export function encodeCustomEvent(event) {
  const data = {
    n: event.name,
    d: event.date,
    i: event.icon,
    t: event.theme,
    a: event.accent || "#22d3ee",
    m: event.description || "",
    u: event.imageUrl || "",
    g: Array.isArray(event.tags) ? event.tags.slice(0, 8) : [],
    x: event.design || null,
  };

  const json = JSON.stringify(data);
  return btoa(
    encodeURIComponent(json)
      .replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function decodeCustomEvent(encoded) {
  try {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const json = decodeURIComponent(
      Array.from(bytes)
        .map((byte) => `%${byte.toString(16).padStart(2, "0")}`)
        .join("")
    );
    const data = JSON.parse(json);

    if (!data || typeof data.n !== "string" || typeof data.d !== "string") {
      return null;
    }

    const date = new Date(data.d);
    if (Number.isNaN(date.getTime())) return null;

    return {
      id: `custom-${encoded.slice(0, 24)}`,
      name: data.n.slice(0, 60),
      date: data.d,
      icon: String(data.i || "🎉").slice(0, 8),
      theme: ["default", "diwali", "christmas", "winter", "holi", "newyear"].includes(data.t) ? data.t : "default",
      accent: data.a || "#22d3ee",
      celebration: null,
      description: String(data.m || `${data.n} is almost here! 🎉`).slice(0, 120),
      imageUrl: typeof data.u === "string" ? data.u.slice(0, 500) : "",
      tags: Array.isArray(data.g) ? data.g.slice(0, 8) : [],
      design: data.x && typeof data.x === "object" ? {
        font: ["sans", "serif", "mono", "display"].includes(data.x.font) ? data.x.font : "sans",
        layout: ["center", "split"].includes(data.x.layout) ? data.x.layout : "center",
        radius: Math.min(40, Math.max(8, Number(data.x.radius) || 24)),
        opacity: Math.min(85, Math.max(20, Number(data.x.opacity) || 58)),
        overlay: Math.min(80, Math.max(0, Number(data.x.overlay) || 35)),
        animation: data.x.animation === "off" ? "off" : "on",
        backgroundImage: typeof data.x.backgroundImage === "string" ? data.x.backgroundImage.slice(0, 500) : "",
      } : null,
      shareToken: encoded,
      custom: true,
    };
  } catch {
    return null;
  }
}

export function escapeICS(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

export function downloadICS(event) {
  const start = new Date(event.date);
  const end = new Date(start.getTime() + 86400000);

  const format = (date) =>
    date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Event Countdown//EN
BEGIN:VEVENT
DTSTART:${format(start)}
DTEND:${format(end)}
SUMMARY:${escapeICS(event.name)}
DESCRIPTION:${escapeICS(event.description)}
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${event.id}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function openGoogleCalendar(event) {
  const start = new Date(event.date);
  const end = new Date(start.getTime() + 86400000);
  const format = (date) =>
    date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

  const url =
    "https://calendar.google.com/calendar/render" +
    "?action=TEMPLATE" +
    `&text=${encodeURIComponent(event.name)}` +
    `&dates=${format(start)}/${format(end)}` +
    `&details=${encodeURIComponent(event.description || "")}`;

  const win = window.open(url, "_blank", "noopener,noreferrer");
  if (!win) downloadICS(event);
}
