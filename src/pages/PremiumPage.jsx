import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BackgroundEffects from '../components/layout/BackgroundEffects';
import PlatformNav from '../components/layout/PlatformNav';
import { getBillingEntitlement, startCheckout } from '../services/billingService';
import styles from '../styles/features/Pro.module.css';

const FREE = ['10 local countdowns', 'Community discovery', 'Basic sharing', 'PWA / offline shell'];
const PRO = ['Unlimited creator slots', 'Remove platform branding', 'Advanced analytics', 'Custom domain ready', 'Branded embeds', 'Creator collections'];

export default function PremiumPage() {
  const [entitlement, setEntitlement] = useState({ active: false, plan: 'free', subscription: null });
  const [status, setStatus] = useState('');

  useEffect(() => {
    let cancelled = false;
    getBillingEntitlement().then((value) => {
      if (!cancelled) setEntitlement(value);
    });
    return () => { cancelled = true; };
  }, []);

  const activate = async () => {
    setStatus('Opening secure checkout…');
    try { await startCheckout({ plan: 'pro_monthly' }); }
    catch (error) { setStatus(error.message); }
  };

  const pro = entitlement.active;
  return <div><BackgroundEffects /><main className={`main-container ${styles.page}`}><PlatformNav />
    <section className="section-heading mx-auto mt-6 max-w-3xl text-center"><span className="eyebrow">PHASE 23 • PRO / BUSINESS</span><h1>Build bigger moments.</h1><p>Pro access is granted from a verified subscription. The browser never decides whether an account has paid.</p></section>
    <section className={styles.compare}>
      <article className={styles.plan}><span className="eyebrow">FREE</span><h2>Starter</h2><p>Everything needed for personal countdowns.</p><ul>{FREE.map((x) => <li key={x}>✓ {x}</li>)}</ul><button className={styles.planButton} type="button" disabled={!pro}>Free plan</button></article>
      <article className={`${styles.plan} ${styles.pro}`}><span className="eyebrow">COUNTDOWN PRO</span><h2>Creator Pro</h2><p>Advanced creator and business features backed by verified billing.</p><ul>{PRO.map((x) => <li key={x}>✦ {x}</li>)}</ul><button className="create-countdown-btn inline-flex w-fit" type="button" onClick={activate} disabled={pro}>{pro ? `✓ ${entitlement.plan} active` : 'Upgrade securely'}</button></article>
    </section>
    <section className={styles.notice}><strong>{pro ? '✓ Subscription active' : 'Secure billing'}</strong><p>{status || (pro ? `Your ${entitlement.plan} subscription is active.` : 'Checkout is handled server-side and Pro is activated only after a verified provider webhook.')}</p><small>Stripe secrets and webhook signing secrets belong in Supabase Edge Function secrets, never in Vite environment variables.</small></section>
    <div className="mt-5 flex flex-wrap justify-center gap-2"><Link className="dashboard-link-btn inline-flex w-fit" to="/dashboard">Dashboard</Link><Link className="dashboard-link-btn inline-flex w-fit" to="/community">Community</Link><Link className="dashboard-link-btn inline-flex w-fit" to="/billing">💳 Billing</Link></div>
  </main></div>;
}
