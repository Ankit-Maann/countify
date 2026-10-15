import { useState } from 'react';
import { Link } from 'react-router-dom';
import BackgroundEffects from '../components/layout/BackgroundEffects';
import PlatformNav from '../components/layout/PlatformNav';
import { useCountdownStore } from '../store/useCountdownStore';
import { getBookmarks, toggleBookmark } from '../services/communityService';
import styles from '../styles/features/Community.module.css';

export default function SavedPage() {
  const local = useCountdownStore((s) => s.customCountdowns); const [, setVersion] = useState(0);
  const saved = (() => { const ids = getBookmarks(); return local.filter((x) => ids.includes(String(x.id))); })();
  return <div><BackgroundEffects /><main className={`main-container ${styles.page}`}><PlatformNav /><section className="section-heading mx-auto mt-6 max-w-3xl text-center"><span className="eyebrow">YOUR LIBRARY</span><h1>Saved Countdowns</h1><p>Your bookmarked moments, stored locally.</p></section>
    {!saved.length ? <section className={styles.empty}><span>☆</span><h2>No saved countdowns</h2><p>Save a countdown from Community and it will appear here.</p><Link className="create-countdown-btn inline-flex w-fit" to="/community">Explore Community</Link></section> : <section className={styles.grid}>{saved.map((item) => <article className={styles.card} key={item.id}><div className={styles.cover}><span>{item.icon || '🎉'}</span></div><div className="p-5"><h2 className="text-xl font-black">{item.name}</h2><p className="mt-2 text-sm text-[var(--muted)]">{item.description}</p><div className="mt-4 flex flex-wrap gap-2"><Link className={styles.smallButton} to={item.slug ? `/c/${item.slug}` : '/'}>Open</Link><button className={styles.smallButton} onClick={() => { toggleBookmark(item.id); setVersion((v) => v + 1); }}>Remove</button></div></div></article>)}</section>}
  </main></div>;
}
