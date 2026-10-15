import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import BackgroundEffects from '../components/layout/BackgroundEffects';
import PlatformNav from '../components/layout/PlatformNav';
import { useCountdownStore } from '../store/useCountdownStore';
import { getProfile, isFollowing, toggleFollow } from '../services/communityService';
import styles from '../styles/features/Community.module.css';

export default function CreatorProfilePage() {
  const { username } = useParams();
  const local = useCountdownStore((s) => s.customCountdowns);
  const profile = getProfile();
  const creator = profile.username === username ? profile : { username, displayName: username?.replace(/-/g, ' '), bio: 'Countdown creator', avatar: '✨' };
  const [following, setFollowing] = useState(isFollowing(username));
  const items = useMemo(() => profile.username === username ? local : [], [local, profile.username, username]);
  return <div><BackgroundEffects /><main className={`main-container ${styles.page}`}><PlatformNav />
    <section className={styles.profileHero}><div className={styles.avatar}>{creator.avatar}</div><div className="min-w-0"><span className="eyebrow">CREATOR PROFILE</span><h1 className="break-words text-4xl font-black capitalize">{creator.displayName}</h1><p className="mt-2 break-words text-[var(--muted)]">@{creator.username}</p><p className="mt-3 max-w-2xl text-[var(--muted)]">{creator.bio}</p></div><button className="create-countdown-btn inline-flex w-fit" onClick={() => { setFollowing(toggleFollow(username)); }}>{following ? 'Following ✓' : 'Follow +'}</button></section>
    <section className="section-heading mt-10"><span className="eyebrow">PUBLIC WORK</span><h2>Countdowns by {creator.displayName}</h2></section>
    {!items.length ? <section className={styles.empty}><span>✨</span><h2>No public countdowns yet</h2><Link className="dashboard-link-btn mt-4 inline-flex w-fit" to="/community">← Back to Community</Link></section> : <section className={styles.grid}>{items.map((item) => <article className={styles.card} key={item.id}><div className={styles.cover}><span>{item.icon || '🎉'}</span></div><div className="p-5"><h3 className="text-xl font-black">{item.name}</h3><p className="mt-2 text-sm text-[var(--muted)]">{item.description}</p><Link className="mt-4 inline-flex text-[var(--accent)]" to={item.slug ? `/c/${item.slug}` : '/'}>Open Countdown →</Link></div></article>)}</section>}
  </main></div>;
}
