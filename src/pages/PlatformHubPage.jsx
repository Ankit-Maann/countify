import { Link } from 'react-router-dom';
import BackgroundEffects from '../components/layout/BackgroundEffects';
import PlatformNav from '../components/layout/PlatformNav';
import styles from '../styles/features/FeaturePage.module.css';

const features = [
 ['🤖','AI Creator','Natural-language countdown design generation.','/ai'],
 ['🎨','Design Studio','Advanced themes, typography, layouts and animation.','/design'],
 ['🌐','Discovery','Explore public countdowns, creators, tags and trends.','/explore'],
 ['📣','Growth Studio','Social cards, QR sharing, referrals and campaigns.','/share'],
 ['🛍️','Theme Marketplace','Community and premium theme ecosystem.','/marketplace'],
 ['📊','Advanced Analytics','Creator, campaign, embed and conversion insights.','/analytics'],
 ['🏢','Teams & Business','Workspaces, roles, brand kits and approvals.','/business'],
 ['🧩','Embeds','Responsive countdown widgets for websites.','/embed'],
 ['💳','Billing','Subscriptions, checkout and customer portal.','/billing'],
];

export default function PlatformHubPage() { return <div><BackgroundEffects /><main className={`main-container ${styles.page}`}><PlatformNav />
 <section className="section-heading mx-auto mt-6 max-w-3xl text-center"><span className="eyebrow">COUNTIFY PLATFORM • v5.0.0</span><h1>Everything is here.</h1><p>These features are intentionally discoverable outside Pro. Pro controls access, limits and monetization — it should never hide the product from users.</p></section>
 <section className="mx-auto grid w-full max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">{features.map(([icon,title,copy,to])=><Link key={title} to={to} className="countdown-card !m-0 block transition hover:-translate-y-1"><div className="event-icon">{icon}</div><h2 className="text-xl">{title}</h2><p className="event-description">{copy}</p><span className="dashboard-link-btn mt-3 inline-flex">Open →</span></Link>)}</section>
 </main></div>; }
