import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCountdownStore } from "../store/useCountdownStore";
import { validateCountdown } from "../utils/security";
import { encodeCustomEvent } from "../utils/countdown";
import BackgroundEffects from "../components/layout/BackgroundEffects";
import PlatformNav from "../components/layout/PlatformNav";
import styles from "../styles/features/FeaturePage.module.css";

const templates = [
  { id: "classic", name: "Classic", icon: "✨", theme: "default", accent: "#22d3ee" },
  { id: "birthday", name: "Birthday", icon: "🎂", theme: "candy", accent: "#fb7185" },
  { id: "festival", name: "Festival", icon: "🪔", theme: "diwali", accent: "#f59e0b" },
  { id: "exam", name: "Exam", icon: "📚", theme: "midnight", accent: "#a78bfa" },
  { id: "trip", name: "Trip", icon: "✈️", theme: "ocean", accent: "#06b6d4" },
  { id: "wedding", name: "Wedding", icon: "💍", theme: "sunset", accent: "#fb7185" },
];

export default function CreatorStudioPage() {
  const setCustomCountdowns = useCountdownStore((s) => s.setCustomCountdowns);
  const custom = useCountdownStore((s) => s.customCountdowns);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", date: "", time: "00:00", icon: "🎉", description: "", accent: "#22d3ee", theme: "default", imageUrl: "", tags: "" });
  const [template, setTemplate] = useState("classic");
  const [status, setStatus] = useState("");

  const preview = useMemo(() => ({ ...form, date: form.date ? `${form.date}T${form.time}` : "", name: form.name || "Your Countdown", icon: form.icon || "🎉" }), [form]);
  const patch = (key, value) => setForm((s) => ({ ...s, [key]: value }));
  const applyTemplate = (id) => { const t = templates.find((x) => x.id === id); if (t) { setTemplate(id); setForm((s) => ({ ...s, icon: t.icon, theme: t.theme, accent: t.accent })); } };
  const create = (e) => {
    e.preventDefault(); setStatus("");
    try {
      const valid = validateCountdown({ ...form, date: `${form.date}T${form.time}` });
      const item = { ...valid, id: `custom-${crypto.randomUUID()}`, custom: true, celebration: null, shareToken: "" };
      item.shareToken = encodeCustomEvent(item);
      setCustomCountdowns([item, ...custom.filter((x) => x.id !== item.id)].slice(0, 10));
      setStatus("✨ Countdown created and saved locally.");
      navigate("/");
    } catch (error) { setStatus(error.message || "Could not create countdown."); }
  };

  return <div><BackgroundEffects /><main className={`main-container creator-studio ${styles.page} mx-auto w-full max-w-[960px]`}><PlatformNav />
    <section className="section-heading"><span className="eyebrow">PHASE 16 • CREATOR 2.0</span><h1>Countdown Studio</h1><p>Templates, custom visuals, tags and media-ready countdowns.</p></section>
    <div className={`studio-layout ${styles.content}`}><section className={`create-card ${styles.card} ${styles.formCard}`}><div className="template-row">{templates.map((t) => <button type="button" key={t.id} className={template === t.id ? "active" : ""} onClick={() => applyTemplate(t.id)}>{t.icon} {t.name}</button>)}</div>
      <form onSubmit={create}>
        <div className="form-group"><label>Event name</label><input value={form.name} maxLength={60} onChange={(e) => patch("name", e.target.value)} required /></div>
        <div className="form-row"><div className="form-group"><label>Date</label><input type="date" value={form.date} min={new Date().toISOString().slice(0,10)} onChange={(e) => patch("date", e.target.value)} required /></div><div className="form-group"><label>Time</label><input type="time" value={form.time} onChange={(e) => patch("time", e.target.value)} required /></div></div>
        <div className="form-row"><div className="form-group"><label>Icon</label><input value={form.icon} maxLength={8} onChange={(e) => patch("icon", e.target.value)} /></div><div className="form-group"><label>Accent</label><input type="color" value={form.accent} onChange={(e) => patch("accent", e.target.value)} /></div></div>
        <div className="form-group"><label>Message</label><textarea value={form.description} maxLength={160} onChange={(e) => patch("description", e.target.value)} /></div>
        <div className="form-group"><label>Hero image URL <small>(optional)</small></label><input value={form.imageUrl} placeholder="https://…" onChange={(e) => patch("imageUrl", e.target.value)} /></div>
        <div className="form-group"><label>Tags <small>(comma separated)</small></label><input value={form.tags} placeholder="birthday, celebration" onChange={(e) => patch("tags", e.target.value)} /></div>
        <button className={`create-countdown-btn ${styles.action}`} type="submit">✨ Create Countdown</button>
        {status && <p className="create-status">{status}</p>}
      </form>
    </section>
    <aside className={`studio-preview ${styles.previewCard}`} style={{ "--studio-accent": preview.accent }}><span className="eyebrow">LIVE PREVIEW</span>{preview.imageUrl && <img src={preview.imageUrl} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} />}<div className="preview-icon">{preview.icon}</div><h2>{preview.name}</h2><p>{preview.description || "Your special moment is almost here."}</p><div className="preview-box"><strong>00</strong><span>DAYS</span><strong>00</strong><span>HRS</span><strong>00</strong><span>MIN</span></div><small>{preview.theme} · {preview.tags || "no tags"}</small></aside></div>
    <Link className="dashboard-link-btn" to="/">← Back to Countdown</Link>
  </main></div>;
}
