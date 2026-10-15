import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import BackgroundEffects from '../components/layout/BackgroundEffects';
import PlatformNav from '../components/layout/PlatformNav';
import { useCountdownStore } from '../store/useCountdownStore';
import { toggleBookmark, toggleLike, isBookmarked, isLiked, getProfile, reportCountdown } from '../services/communityService';
import styles from '../styles/features/Community.module.css';

export default function CommunityPage() {
  const local = useCountdownStore((s) => s.customCountdowns);
  const profile = getProfile();
  const [query, setQuery] = useState('');
  const [, setVersion] = useState(0);
  const items = useMemo(() => local.map((x) => ({ ...x, creator: profile.username, creatorName: profile.displayName })).filter((x) => `${x.name} ${x.description} ${(x.tags || []).join(' ')}`.toLowerCase().includes(query.toLowerCase())), [local, profile, query]);

  return <div><BackgroundEffects /><main className={`main-container ${styles.page}`}>
    <PlatformNav />
    <section className="section-heading mx-auto mt-6 max-w-3xl text-center"><span className="eyebrow">PHASE 22 • COMMUNITY</span><h1>Discover creators &amp; moments.</h1><p>Save, like and share countdowns. Your local library works even without Cloud.</p></section>
    <section className={styles.toolbar}><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search countdowns, tags..." aria-label="Search community" /></section>
    {!items.length ? <section className={styles.empty}><span>🌎</span><h2>No community countdowns yet</h2><p>Create a countdown in Creator Studio, then publish it from Dashboard.</p><Link className="create-countdown-btn inline-flex w-fit" to="/create">✨ Create Countdown</Link></section> : <section className={styles.grid}>
      {items.map((item) => { const liked = isLiked(item.id); const saved = isBookmarked(item.id); return <article className={styles.card} key={item.id}>
        <div className={styles.cover}>{item.imageUrl ? <img src={item.imageUrl} alt="" /> : <span>{item.icon || '🎉'}</span>}</div>
        <div className="p-5"><span className="eyebrow">{item.tags?.[0] || 'COUNTDOWN'}</span><h2 className="mt-2 break-words text-xl font-black">{item.name}</h2><p className="mt-2 break-words text-sm text-[var(--muted)]">{item.description}</p><Link className="mt-3 inline-flex text-sm font-semibold text-[var(--accent)]" to={`/creator/${item.creator}`}>by {item.creatorName}</Link>
          <div className="mt-4 flex flex-wrap gap-2"><button className={styles.smallButton} onClick={() => { toggleLike(item.id); setVersion((v) => v + 1); }}>{liked ? '♥ Liked' : '♡ Like'}</button><button className={styles.smallButton} onClick={() => { toggleBookmark(item.id); setVersion((v) => v + 1); }}>{saved ? '★ Saved' : '☆ Save'}</button><Link className={styles.smallButton} to={item.slug ? `/c/${item.slug}` : '/'}>Open</Link><button className={styles.smallButton} onClick={() => { reportCountdown(item, 'community-report'); setVersion((v) => v + 1); }}>Report</button></div>
        </div>
      </article>; })}
    </section>}
  </main></div>;
}
