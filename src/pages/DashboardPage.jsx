import PlatformNav from "../components/layout/PlatformNav";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCountdownStore } from "../store/useCountdownStore";
import {
  deleteCloudCountdown,
  getAnalytics,
  getMyCountdowns,
  getSession,
  publishCountdown,
  setCountdownVisibility,
  signIn,
  signOut,
  signUp,
  onAuthChange,
} from "../services/countdownService";
import { publicLink } from "../services/publicLink";
import styles from "../styles/features/FeaturePage.module.css";

export default function DashboardPage() {
  const local = useCountdownStore((s) => s.customCountdowns);
  const [session, setSession] = useState(null);
  const [cloud, setCloud] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const refresh = useCallback(async (current = session) => {
    if (!current) return;
    const rows = await getMyCountdowns();
    setCloud(rows);
    setAnalytics(await getAnalytics(rows.map((x) => x.id)));
  }, [session]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const current = await getSession();
      if (mounted) {
        setSession(current);
        if (current) await refresh(current);
        setLoading(false);
      }
    })();
    const unsubscribe = onAuthChange((next) => { if (mounted) setSession(next); });
    return () => { mounted = false; unsubscribe(); };
  }, [refresh]);

  const totals = useMemo(() => ({
    views: analytics.filter((x) => x.event_type === "view").length,
    shares: analytics.filter((x) => x.event_type === "share").length,
    qr: analytics.filter((x) => x.event_type === "qr_scan").length,
    unique: new Set(analytics.map((x) => x.visitor_id).filter(Boolean)).size,
  }), [analytics]);

  const auth = async (e) => {
    e.preventDefault();
    setStatus("");
    try {
      const result = mode === "login" ? await signIn(email, password) : await signUp(email, password);
      if (result.error) throw result.error;
      const current = result.data?.session || await getSession();
      setSession(current);
      setStatus(mode === "login" ? "Welcome back." : "Account created. Check your email if confirmation is enabled.");
      if (current) await refresh(current);
    } catch (error) {
      setStatus(error.message || "Authentication failed.");
    }
  };

  const publish = async (item) => {
    try {
      const result = await publishCountdown(item);
      if (result.event) {
        setStatus(`Published "${item.name}".`);
        await refresh();
      }
    } catch (error) {
      setStatus(error.message || "Could not publish.");
    }
  };

  const toggle = async (item) => {
    try {
      await setCountdownVisibility(item.id, !item.is_public);
      await refresh();
    } catch (error) {
      setStatus(error.message || "Could not update visibility.");
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete "${item.name}" from the cloud?`)) return;
    try {
      await deleteCloudCountdown(item.id);
      await refresh();
    } catch (error) {
      setStatus(error.message || "Could not delete.");
    }
  };

  if (loading) return <main className="main-container"><PlatformNav /><section className="countdown-card"><h1>Loading…</h1></section></main>;

  return (
    <main className={`main-container dashboard-page ${styles.pageNarrow} mx-auto w-full max-w-[920px]`}><PlatformNav />
      <section className="section-heading">
        <span className="eyebrow">COUNTDOWN CLOUD</span>
        <h1>Your Dashboard</h1>
        <p>Publish countdowns, manage public links and see privacy-friendly analytics.</p>
      </section>

      {!session ? (
        <section className={`create-card cloud-auth-card ${styles.formCard}`}>
          <h2>{mode === "login" ? "Sign in" : "Create account"}</h2>
          <p className="modal-subtitle">Cloud features are optional. Your local countdowns remain available without an account.</p>
          <form onSubmit={auth}>
            <div className="form-group"><label>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div className="form-group"><label>Password</label><input type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
            <button className={`create-countdown-btn ${styles.action}`} type="submit">{mode === "login" ? "Sign In" : "Create Account"}</button>
          </form>
          <button className="dashboard-link-btn" type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
            {mode === "login" ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
          {status && <p className="create-status">{status}</p>}
        </section>
      ) : (
        <>
          <section className="analytics-grid">
            <div className="analytics-card"><strong>{totals.views}</strong><span>Views</span></div>
            <div className="analytics-card"><strong>{totals.unique}</strong><span>Unique visitors</span></div>
            <div className="analytics-card"><strong>{totals.shares}</strong><span>Shares</span></div>
            <div className="analytics-card"><strong>{totals.qr}</strong><span>QR scans</span></div>
          </section>

          <section className="dashboard-panel">
            <div className="dashboard-panel-head"><div><span className="eyebrow">LOCAL → CLOUD</span><h2>Publish your countdowns</h2></div><button className="dashboard-link-btn" onClick={async () => { await signOut(); setSession(null); }}>Sign out</button></div>
            {!local.length ? <p className="event-description">No local countdowns yet.</p> : local.map((item) => (
              <div className="dashboard-row" key={item.id}>
                <div><strong>{item.icon} {item.name}</strong><span>{new Date(item.date).toLocaleString()}</span></div>
                <button className="event-action" onClick={() => publish(item)}>Publish</button>
              </div>
            ))}
          </section>

          <section className="dashboard-panel">
            <div className="dashboard-panel-head"><div><span className="eyebrow">CLOUD EVENTS</span><h2>Published countdowns</h2></div></div>
            {!cloud.length ? <p className="event-description">Nothing published yet.</p> : cloud.map((item) => (
              <div className="dashboard-row" key={item.id}>
                <div><strong>{item.icon} {item.name}</strong><span>{item.is_public ? "Public" : "Private"} · {item.slug}</span></div>
                <div className="dashboard-row-actions">
                  <button className="event-action" onClick={() => navigator.clipboard.writeText(publicLink({ ...item, cloudId: item.id }))}>Copy link</button>
                  <button className="event-action" onClick={() => toggle(item)}>{item.is_public ? "Make private" : "Make public"}</button>
                  <button className="my-countdown-delete" onClick={() => remove(item)}>🗑️</button>
                </div>
              </div>
            ))}
          </section>
          {status && <p className="create-status">{status}</p>}
          <div className="dashboard-footer-links"><button className="dashboard-link-btn" onClick={() => navigate("/create")}>✨ Creator Studio</button><button className="dashboard-link-btn" onClick={() => navigate("/explore")}>🌐 Explore</button><button className="dashboard-link-btn" onClick={() => navigate("/premium")}>✦ Premium</button><button className="dashboard-link-btn" onClick={() => navigate("/")}>← Back to Countdown</button></div>
        </>
      )}
    </main>
  );
}
