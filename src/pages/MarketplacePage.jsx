import { Link } from 'react-router-dom';
import BackgroundEffects from '../components/layout/BackgroundEffects';
import PlatformNav from '../components/layout/PlatformNav';
import styles from '../styles/features/FeaturePage.module.css';

const themes = [
  ['Aurora Countdown','🌌','Free'], ['Diwali Glow','🪔','Free'], ['Midnight Pro','🌙','Pro'], ['Celebration Gold','✨','Pro'], ['Business Minimal','▦','Business'], ['Candy Pop','🍭','Pro']
];
export default function MarketplacePage(){return <div><BackgroundEffects/><main className={`main-container ${styles.page}`}><PlatformNav/><section className="section-heading mx-auto mt-6 max-w-3xl text-center"><span className="eyebrow">PHASE 29 • THEME MARKETPLACE</span><h1>Designs made by creators.</h1><p>Browse reusable visual systems. Paid purchases are fulfilled by the configured billing provider; this page never handles provider secrets.</p></section><section className="mx-auto grid w-full max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">{themes.map(([name,icon,badge])=><article key={name} className="countdown-card !m-0"><div className="event-icon">{icon}</div><span className="eyebrow">{badge}</span><h2>{name}</h2><p className="event-description">Preview and apply this visual direction in Design Studio.</p><Link className="dashboard-link-btn mt-3 inline-flex" to="/design">Open in Studio</Link></article>)}</section></main></div>}
