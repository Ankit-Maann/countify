import { useState } from 'react';
import { Link } from 'react-router-dom';
import BackgroundEffects from '../components/layout/BackgroundEffects';
import PlatformNav from '../components/layout/PlatformNav';
import { billingConfigured, openBillingPortal, startCheckout } from '../services/billingService';
import styles from '../styles/features/FeaturePage.module.css';

const plans = [
  { id: 'pro_monthly', title: 'Pro Monthly', price: '₹199 / month', copy: 'For creators who want the full platform.' },
  { id: 'pro_yearly', title: 'Pro Yearly', price: '₹1,499 / year', copy: 'Best value for serious creators.' },
  { id: 'business', title: 'Business', price: 'Custom', copy: 'Teams, brand kits, domains and advanced analytics.' },
];

export default function BillingPage() {
  const [status, setStatus] = useState('');
  const checkout = async (plan) => { setStatus('Opening secure checkout…'); try { await startCheckout({ plan }); } catch (e) { setStatus(e.message); } };
  const portal = async () => { try { await openBillingPortal(); } catch (e) { setStatus(e.message); } };
  return <div><BackgroundEffects /><main className={`main-container ${styles.page}`}><PlatformNav />
    <section className="section-heading mx-auto mt-6 max-w-3xl text-center"><span className="eyebrow">PHASE 31 • REAL BILLING</span><h1>Choose your plan.</h1><p>Production Stripe checkout with server-side secrets, signed webhooks and verified subscription entitlements.</p></section>
    <section className="mx-auto grid w-full max-w-5xl gap-4 md:grid-cols-3">{plans.map((p) => <article key={p.id} className="countdown-card !m-0 flex flex-col"><span className="eyebrow">{p.id === 'business' ? 'BUSINESS' : 'PRO'}</span><h2>{p.title}</h2><strong className="my-3 text-2xl">{p.price}</strong><p className="event-description">{p.copy}</p><button className="create-countdown-btn mt-auto" type="button" onClick={() => checkout(p.id)}>Continue to secure checkout</button></article>)}</section>
    <section className="mx-auto mt-5 w-full max-w-3xl rounded-2xl border border-white/10 bg-white/[.04] p-5 text-center"><strong>{billingConfigured ? '✓ Secure billing connected' : 'Billing connection required'}</strong><p className="mt-2 text-sm text-[var(--muted)]">{status || (billingConfigured ? 'Checkout and subscription state are handled by Supabase Edge Functions.' : 'Stripe checkout is implemented through Supabase Edge Functions. Add the production Stripe secrets and deploy the functions before accepting payments.')}</p>{import.meta.env.VITE_BILLING_PORTAL_URL && <button className="dashboard-link-btn mt-3" onClick={portal}>Manage billing</button>}</section>
    <div className="mt-5 flex justify-center"><Link className="dashboard-link-btn" to="/premium">← Pro overview</Link></div>
  </main></div>;
}
