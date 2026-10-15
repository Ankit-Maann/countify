import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import BackgroundEffects from "../components/layout/BackgroundEffects";
import PlatformNav from "../components/layout/PlatformNav";
import CountdownCard from "../components/countdown/CountdownCard";
import Celebration from "../components/modals/Celebration";
import ShareModal from "../components/modals/ShareModal";
import { useCountdown } from "../hooks/useCountdown";
import { decodeCustomEvent, openGoogleCalendar } from "../utils/countdown";
import { getPublicCountdown, trackAnalytics, getVisitorId } from "../services/countdownService";

function normalizeCloud(row) {
  if (!row) return null;
  return {
    id: `cloud-${row.id}`,
    cloudId: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    date: row.date,
    icon: row.icon,
    theme: row.theme,
    accent: row.accent,
    imageUrl: row.image_url,
    tags: row.tags,
    design: row.design || null,
    custom: true,
    public: row.is_public,
  };
}

export default function PublicCountdownPage() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const countdown = useCountdown(event);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const cloud = await getPublicCountdown(slug);
        if (cloud && active) {
          const normalized = normalizeCloud(cloud);
          setEvent(normalized);
          trackAnalytics({ countdownId: cloud.id, eventType: "view", visitorId: getVisitorId() });
          if (params.get("ref") === "qr") {
            trackAnalytics({ countdownId: cloud.id, eventType: "qr_scan", visitorId: getVisitorId() });
          }
          return;
        }
        const token = params.get("data");
        const local = token ? decodeCustomEvent(token) : null;
        if (active) setEvent(local);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [slug, params]);

  const next = useMemo(() => null, []);

  useEffect(() => {
    if (!event) return;
    const title = `${event.name} • Countdown`;
    const description = event.description || `${event.name} is almost here!`;
    document.title = title;
    const created = [];
    const upsert = (property, content) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) { tag = document.createElement("meta"); tag.setAttribute("property", property); document.head.appendChild(tag); created.push(tag); }
      tag.setAttribute("content", content);
      return tag;
    };
    upsert("og:title", title); upsert("og:description", description);
    upsert("og:url", window.location.href); upsert("og:type", "website");
    if (event.imageUrl) upsert("og:image", event.imageUrl);
    const twitter = (name, content) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) { tag = document.createElement("meta"); tag.setAttribute("name", name); document.head.appendChild(tag); }
      tag.setAttribute("content", content); return tag;
    };
    twitter("twitter:card", event.imageUrl ? "summary_large_image" : "summary");
    twitter("twitter:title", title); twitter("twitter:description", description);
    if (event.imageUrl) twitter("twitter:image", event.imageUrl);
    return () => { document.title = "Countdown"; created.forEach((tag) => tag.remove()); };
  }, [event]);

  if (loading) {
    return <main className="main-container"><PlatformNav /><section className="countdown-card"><div className="event-icon">⏳</div><h1>Loading countdown…</h1></section></main>;
  }

  if (!event) {
    return <main className="main-container"><PlatformNav /><section className="countdown-card"><div className="event-icon">🔎</div><p className="eyebrow">COUNTDOWN NOT FOUND</p><h1>This countdown isn't available</h1><p className="event-description">The link may be private, expired, or no longer exists.</p></section></main>;
  }

  const embed = params.get("embed") === "1";

  return (
    <div className={`public-countdown-page ${embed ? "embed-mode" : ""}`}>
      <BackgroundEffects />
      <main className="main-container"><PlatformNav />
        <p className="eyebrow public-badge">PUBLIC COUNTDOWN</p>
        <CountdownCard
          event={event}
          countdown={countdown}
          nextEvent={next}
          onReminder={() => {}}
          onShare={() => setShareOpen(true)}
          onCalendar={() => openGoogleCalendar(event)}
        />
      </main>
      <ShareModal event={event} open={shareOpen} onClose={() => setShareOpen(false)} />
      <Celebration event={event} open={false} onClose={() => {}} />
    </div>
  );
}
