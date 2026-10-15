import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import QRCode from "qrcode";
import BackgroundEffects from "../components/layout/BackgroundEffects";
import PlatformNav from "../components/layout/PlatformNav";
import styles from "../styles/features/FeaturePage.module.css";
import { decodeCustomEvent } from "../utils/countdown";
import { publicLink } from "../services/publicLink";
import { trackAnalytics } from "../services/countdownService";
import { useCountdownStore } from "../store/useCountdownStore";

function currentEvent(location, local) {
  const params = new URLSearchParams(location.search);
  const token = params.get("custom");
  if (token) return decodeCustomEvent(token);
  return local[0] || null;
}

export default function SocialStudioPage() {
  const location = useLocation();
  const local = useCountdownStore((s) => s.customCountdowns);
  const event = currentEvent(location, local);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("");
  const link = useMemo(() => event ? publicLink(event) : window.location.origin, [event]);
  const qrLink = `${link}${link.includes("?") ? "&" : "?"}ref=qr`;
  const embedCode = `<iframe src="${link}${link.includes("?") ? "&" : "?"}embed=1" title="${event?.name || "Countdown"}" loading="lazy" style="width:100%;min-height:520px;border:0;border-radius:20px;overflow:hidden"></iframe>`;

  useEffect(() => { if (canvasRef.current) QRCode.toCanvas(canvasRef.current, qrLink, { width: 230, margin: 2, errorCorrectionLevel: "M" }).catch(() => {}); }, [qrLink]);

  const copy = async (value, message) => { try { await navigator.clipboard.writeText(value); setStatus(message); if (event?.cloudId) trackAnalytics({ countdownId: event.cloudId, eventType: "share" }); } catch { setStatus("Copy is unavailable in this browser."); } };
  const share = async () => { if (!event) return; if (navigator.share) { try { await navigator.share({ title: event.name, text: event.description || "A countdown worth sharing.", url: link }); } catch { /* user cancelled or share is unavailable */ } } else copy(link, "🔗 Link copied."); };

  return <div><BackgroundEffects /><main className={`main-container social-page ${styles.page} mx-auto w-full max-w-[960px]`}><PlatformNav />
    <nav className="phase-nav"><Link to="/">Countdown</Link><Link to="/ai">AI Creator</Link><Link to="/design">Design Studio</Link><Link to="/explore">Explore</Link></nav>
    <section className="section-heading text-center"><span className="eyebrow">PHASE 21 • SOCIAL &amp; VIRAL</span><h1>Share the moment everywhere.</h1><p>Social sharing, QR, embeddable countdowns and creator-friendly preview cards.</p></section>
    <div className={`grid gap-5 lg:grid-cols-[1.15fr_.85fr] ${styles.grid}`}>
      <section className={`social-card ${styles.card}`}>
        <div className="social-preview-card"><div className="placeholder">{event?.icon || "⏳"}</div><div><h3>{event?.name || "Your Countdown"}</h3><p>{event?.description || "Create a countdown first to generate a share card."}</p><div className="social-url mt-2">{link}</div></div></div>
        <div className="social-actions mt-5"><button className="social-action" onClick={share}>📤 <strong>Native Share</strong><br/><small>Use your phone's share sheet</small></button><button className="social-action" onClick={() => copy(link, "🔗 Public link copied.")}>🔗 <strong>Copy Link</strong><br/><small>Ready for WhatsApp &amp; social</small></button><button className="social-action" onClick={() => copy(`🎉 ${event?.name || "Countdown"}\n${event?.description || "A special moment is coming!"}\n${link}`, "📝 Social caption copied.")}>📝 <strong>Copy Caption</strong><br/><small>Post-ready text</small></button></div>
        <div className="embed-box"><label className="block text-xs font-black uppercase tracking-wider text-[var(--muted)]">Embed widget</label><textarea className="mt-2 rounded-2xl border border-white/10 bg-black/10 p-3 text-sm text-[var(--text)]" readOnly value={embedCode}/><button className={`event-action mt-3 ${styles.cardButton}`} onClick={() => copy(embedCode, "🧩 Embed code copied.")}>Copy Embed Code</button></div>
        <p className="social-status" aria-live="polite">{status}</p>
      </section>
      <aside className={`social-card text-center ${styles.previewCard}`}><span className="eyebrow">QR SHARE</span><canvas ref={canvasRef} className="mx-auto mt-4 rounded-xl bg-white p-2" aria-label="Countdown QR code"/><p className="event-description mt-4">Scan to open the public countdown. QR visits are tracked when Cloud is enabled.</p><button className={`event-action ${styles.cardButton}`} onClick={() => { const a=document.createElement("a"); a.href=canvasRef.current?.toDataURL("image/png") || ""; a.download="countdown-qr.png"; a.click(); }}>Save QR</button></aside>
    </div>
  </main></div>;
}
