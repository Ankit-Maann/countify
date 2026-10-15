import BackgroundEffects from "../components/layout/BackgroundEffects";
import PlatformNav from "../components/layout/PlatformNav";
import { APP_VERSION, MILESTONE, RELEASE_DATE, RELEASE_NAME } from "../config/appVersion";
import styles from "../styles/features/Release.module.css";

export default function ReleasePage() {
  return <div><BackgroundEffects /><main className={`main-container ${styles.page}`}><PlatformNav />
    <section className="section-heading mx-auto mt-6 max-w-3xl text-center">
      <span className="eyebrow">{MILESTONE}</span>
      <div className={`${styles.badge} mx-auto mt-3`}><span>VERSION</span><span className={styles.version}>{APP_VERSION}</span></div>
      <h1>{RELEASE_NAME}</h1>
      <p>Stable, faster and more app-like — without changing the Phase 8 visual identity.</p>
    </section>
    <section className={styles.card}>
      <div className="grid gap-2 sm:grid-cols-3">
        <div><strong>Phase 25</strong><p className="text-sm text-[var(--muted)]">QA & regression hardening</p></div>
        <div><strong>Phase 26</strong><p className="text-sm text-[var(--muted)]">Performance 2.0</p></div>
        <div><strong>Phase 27</strong><p className="text-sm text-[var(--muted)]">Mobile app experience</p></div>
      </div>
      <p className="mt-5 text-xs text-[var(--muted)]">Released {RELEASE_DATE} · {APP_VERSION}</p>
    </section>
  </main></div>;
}
