import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { discoverCountdowns } from "../services/discoveryService";
import BackgroundEffects from "../components/layout/BackgroundEffects";
import PlatformNav from "../components/layout/PlatformNav";
import styles from "../styles/features/FeaturePage.module.css";

const tags = ["birthday", "exam", "trip", "wedding", "festival", "holiday", "new-year"];

export default function ExplorePage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      try {
        const rows = await discoverCountdowns({ search, tag });
        if (active) setItems(rows);
      } catch (error) {
        if (active) setStatus(error.message || "Explore is unavailable until Cloud is configured.");
      }
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [search, tag]);

  return <div><BackgroundEffects /><main className={`main-container explore-page ${styles.pageNarrow} mx-auto w-full max-w-[920px]`}><PlatformNav />
    <section className="section-heading explore-hero"><span className="eyebrow">DISCOVER</span><h1>Find a Countdown</h1><p>Explore public countdowns shared by the community.</p></section>
    <section className="explore-controls">
      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search countdowns…" aria-label="Search countdowns" />
      <div className="tag-row"><button className={!tag ? "active" : ""} onClick={() => setTag("")}>All</button>{tags.map((x) => <button className={tag === x ? "active" : ""} key={x} onClick={() => setTag(x)}>#{x}</button>)}</div>
    </section>
    {status && <p className="create-status">{status}</p>}
    <section className={`discover-grid ${styles.grid}`}>{items.map((item) => <article className="discover-card" key={item.id}>
      {item.image_url ? <img src={item.image_url} alt="" loading="lazy" /> : <div className="discover-icon">{item.icon || "🎉"}</div>}
      <div><span className="eyebrow">{item.tags?.[0] || "COUNTDOWN"}</span><h2>{item.name}</h2><p>{item.description}</p><span className="discover-date">{new Date(item.date).toLocaleString()}</span></div>
      <Link className="event-action" to={`/c/${item.slug}`}>Open Countdown</Link>
    </article>)}</section>
    {!items.length && !status && <div className={`empty-state ${styles.singleColumn}`}><span>✨</span><h2>No public countdowns yet</h2><p>Create one and publish it to appear here.</p><Link className={`create-countdown-btn ${styles.cardButton}`} to="/">Create Countdown</Link></div>}
    <Link className="dashboard-link-btn" to="/">← Back</Link>
  </main></div>;
}
