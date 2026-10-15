import { useEffect, useState } from 'react';
import BackgroundEffects from '../components/layout/BackgroundEffects';
import PlatformNav from '../components/layout/PlatformNav';
import { APP_VERSION, MILESTONE } from '../config/appVersion';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { usePerformanceMetrics } from '../hooks/usePerformanceMetrics';
import { getRuntimeInfo, healthCheck } from '../services/productionService';
import styles from '../styles/features/Production.module.css';

export default function StatusPage() {
  const [health, setHealth] = useState(null);
  const online = useOnlineStatus();
  const metrics = usePerformanceMetrics();
  const runtime = getRuntimeInfo();
  useEffect(() => { healthCheck().then(setHealth).catch((e) => setHealth({ status: 'degraded', message: e.message })); }, []);
  const rows = [['App version', APP_VERSION], ['Milestone', MILESTONE], ['App mode', runtime.mode], ['Network', online ? 'Online' : 'Offline'], ['Secure context', runtime.secureContext ? 'Yes' : 'No'], ['Service worker', runtime.serviceWorker ? 'Available' : 'Unavailable'], ['Cloud health', health?.status || 'Checking…'], ['Latency', health?.latency ? `${health.latency} ms` : '—']];
  return <div><BackgroundEffects /><main className={`main-container ${styles.page}`}><PlatformNav /><section className="section-heading mx-auto mt-6 max-w-3xl text-center"><span className="eyebrow">{MILESTONE} • PRODUCTION</span><h1>System Status</h1><p>Runtime health, offline readiness and performance checks.</p></section><section className={styles.card}>{rows.map(([label,value]) => <div className={styles.row} key={label}><span>{label}</span><strong>{value}</strong></div>)}<p className="mt-5 text-sm text-[var(--muted)]">{health?.message || 'Checking runtime…'}</p></section><section className={styles.checkGrid}><div><strong>✓ Error boundary</strong><span>Recovery UI is enabled.</span></div><div><strong>✓ Safe storage</strong><span>Malformed local data is ignored.</span></div><div><strong>✓ Lazy routes</strong><span>Platform pages load on demand.</span></div><div><strong>✓ Mobile PWA</strong><span>Install, offline shell and update handling are enabled.</span></div></section><section className={styles.card}><div className={styles.row}><span>First Contentful Paint</span><strong>{metrics.paint ? `${metrics.paint} ms` : '—'}</strong></div><div className={styles.row}><span>Page load timing</span><strong>{metrics.navigation ? `${metrics.navigation} ms` : '—'}</strong></div><div className={styles.row}><span>JS heap</span><strong>{metrics.memory ? `${metrics.memory} MB` : '—'}</strong></div></section></main></div>;
}
