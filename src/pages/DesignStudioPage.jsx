import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import BackgroundEffects from "../components/layout/BackgroundEffects";
import PlatformNav from "../components/layout/PlatformNav";
import styles from "../styles/features/FeaturePage.module.css";
import { decodeCustomEvent, encodeCustomEvent } from "../utils/countdown";
import { useCountdownStore } from "../store/useCountdownStore";

const defaults = { font: "sans", layout: "center", radius: 24, opacity: 58, overlay: 35, animation: "on", backgroundImage: "" };
const fonts = { sans: "Inter, system-ui, sans-serif", serif: "Georgia, serif", mono: "ui-monospace, monospace", display: "Impact, Haettenschweiler, sans-serif" };

function useSelectedEvent() {
  const location = useLocation();
  const custom = useCountdownStore((s) => s.customCountdowns);
  const params = new URLSearchParams(location.search);
  const token = params.get("custom");
  return token ? decodeCustomEvent(token) : custom[0] || null;
}

export default function DesignStudioPage() {
  const navigate = useNavigate();
  const event = useSelectedEvent();
  const custom = useCountdownStore((s) => s.customCountdowns);
  const setCustom = useCountdownStore((s) => s.setCustomCountdowns);
  const [design, setDesign] = useState({ ...defaults, ...(event?.design || {}) });
  const [status, setStatus] = useState("");

  const background = useMemo(() => design.backgroundImage ? `linear-gradient(rgba(0,0,0,${design.overlay / 100}),rgba(0,0,0,${design.overlay / 100})),url(${design.backgroundImage})` : "linear-gradient(135deg,#111827,#312e81,#0e7490)", [design]);
  const patch = (value) => setDesign((s) => ({ ...s, ...value }));

  const save = () => {
    if (!event) { setStatus("Create a countdown first, then open Design Studio."); return; }
    const nextEvent = { ...event, design };
    const next = custom.map((item) => item.id === event.id ? nextEvent : item);
    if (!custom.some((item) => item.id === event.id)) next.unshift(nextEvent);
    setCustom(next.slice(0, 10));
    const token = encodeCustomEvent(nextEvent);
    setStatus("🎨 Design saved locally.");
    navigate(`/?custom=${encodeURIComponent(token)}`);
  };

  return <div><BackgroundEffects /><main className={`main-container design-page ${styles.page} mx-auto w-full max-w-[960px]`}><PlatformNav />
    <nav className="phase-nav"><Link to="/">Countdown</Link><Link to="/ai">AI Creator</Link><Link to="/create">Creator Studio</Link><Link to="/explore">Explore</Link></nav>
    <section className="section-heading text-center"><span className="eyebrow">PHASE 20 • DESIGN STUDIO</span><h1>Make every second look yours.</h1><p>Typography, layout, glass, motion and hero imagery — with a live preview.</p></section>
    <div className={`design-grid ${styles.content}`}>
      <section className={`design-card ${styles.card}`}>
        <div className="design-controls">
          <div className="design-control"><label>Typography</label><div className="design-pills">{Object.keys(fonts).map((id) => <button key={id} className={design.font === id ? "active" : ""} type="button" onClick={() => patch({ font: id })}>{id}</button>)}</div></div>
          <div className="design-control"><label>Layout</label><div className="design-pills"><button className={design.layout === "center" ? "active" : ""} onClick={() => patch({ layout: "center" })} type="button">Centered</button><button className={design.layout === "split" ? "active" : ""} onClick={() => patch({ layout: "split" })} type="button">Editorial</button></div></div>
          <div className="design-row"><div className="design-control"><label>Card radius</label><input className="w-full accent-[var(--accent)]" type="range" min="8" max="40" value={design.radius} onChange={(e) => patch({ radius: Number(e.target.value) })} /></div><div className="design-control"><label>Glass opacity</label><input className="w-full accent-[var(--accent)]" type="range" min="20" max="85" value={design.opacity} onChange={(e) => patch({ opacity: Number(e.target.value) })} /></div></div>
          <div className="design-control"><label>Background image URL</label><input className="w-full rounded-xl border border-white/10 bg-black/10 p-3 text-[var(--text)]" value={design.backgroundImage} onChange={(e) => patch({ backgroundImage: e.target.value })} placeholder="https://images.example.com/hero.jpg" /></div>
          <div className="design-control"><label>Image overlay</label><input className="w-full accent-[var(--accent)]" type="range" min="0" max="80" value={design.overlay} onChange={(e) => patch({ overlay: Number(e.target.value) })} /></div>
          <div className="design-control"><label>Motion</label><div className="design-pills"><button className={design.animation === "on" ? "active" : ""} type="button" onClick={() => patch({ animation: "on" })}>Cinematic</button><button className={design.animation === "off" ? "active" : ""} type="button" onClick={() => patch({ animation: "off" })}>Reduced</button></div></div>
          <div className="flex flex-wrap gap-2"><button className={`create-countdown-btn ${styles.action}`} type="button" onClick={save}>Save Design</button><button className="dashboard-link-btn" type="button" onClick={() => setDesign({ ...defaults, ...(event?.design || {}) })}>Reset</button></div>
          <p className="design-status" aria-live="polite">{status}</p>
        </div>
      </section>
      <section className={`design-card design-preview ${styles.previewShell}`} style={{ background, fontFamily: fonts[design.font] }}>
        <div className="design-preview-card" style={{ borderRadius: `${design.radius}px`, background: `rgba(10,15,30,${design.opacity / 100})`, textAlign: design.layout === "split" ? "left" : "center" }}>
          <div className="text-4xl mb-4">{event?.icon || "✨"}</div><span className="eyebrow">LIVE COUNTDOWN</span><h2 className="mt-3 text-4xl font-black">{event?.name || "Your Countdown"}</h2><p className="preview-small">{event?.description || "A special moment is coming."}</p><div className="preview-box"><strong>12</strong><span>DAYS</span><strong>08</strong><span>HRS</span><strong>34</strong><span>MIN</span></div><p className="preview-small">Designed in Countdown Studio</p>
        </div>
      </section>
    </div>
  </main></div>;
}
