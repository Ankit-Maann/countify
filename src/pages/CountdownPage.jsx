import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import events from "../data/events.json";
import BackgroundEffects from "../components/layout/BackgroundEffects";
import TopActions from "../components/layout/TopActions";
import CountdownCard from "../components/countdown/CountdownCard";
import PlatformTools from "../components/tools/PlatformTools";
import CreateCountdown from "../components/create/CreateCountdown";
import MyCountdowns from "../components/history/MyCountdowns";
import UpcomingEvents from "../components/events/UpcomingEvents";
import ReminderModal from "../components/modals/ReminderModal";
import ShareModal from "../components/modals/ShareModal";
import AppearanceStudio from "../components/modals/AppearanceStudio";
import TimezoneModal from "../components/modals/TimezoneModal";
import Celebration from "../components/modals/Celebration";
import { useCountdown } from "../hooks/useCountdown";
import { useReminderChecker } from "../hooks/useReminderChecker";
import { useCountdownStore } from "../store/useCountdownStore";
import {
  buildBackground,
  decodeCustomEvent,
  getNextEvent,
  isValidEvent,
  openGoogleCalendar,
} from "../utils/countdown";
import styles from "../styles/AppShell.module.css";

const EVENT_THEMES = ["diwali", "christmas", "winter", "newyear", "holi"];
const VALID_EVENTS = events.filter(isValidEvent);

export default function CountdownPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const currentEvent = useCountdownStore((state) => state.currentEvent);
  const setCurrentEvent = useCountdownStore((state) => state.setCurrentEvent);
  const theme = useCountdownStore((state) => state.theme);
  const appearance = useCountdownStore((state) => state.appearance);
  const setAppearance = useCountdownStore((state) => state.setAppearance);
  const modal = useCountdownStore((state) => state.modal);
  const setModal = useCountdownStore((state) => state.setModal);

  useReminderChecker();

  const [celebrating, setCelebrating] = useState(false);
  const countdown = useCountdown(currentEvent);
  const nextEvent = useMemo(() => getNextEvent(VALID_EVENTS, countdown.now), [countdown.now]);

  const selectEvent = useCallback((event, { history = true, scroll = false } = {}) => {
    if (!event) return;
    setCelebrating(false);
    navigate(`?event=${encodeURIComponent(event.id)}`, { replace: !history });
    if (scroll) {
      window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
    }
  }, [navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const encoded = params.get("custom");
    const custom = encoded ? decodeCustomEvent(encoded) : null;
    const standard = params.get("event")
      ? VALID_EVENTS.find((event) => event.id === params.get("event"))
      : null;
    const selected = custom || standard || getNextEvent(VALID_EVENTS) || VALID_EVENTS[0] || null;

    setCurrentEvent(selected);

    if (!custom && !standard && selected) {
      navigate(`?event=${encodeURIComponent(selected.id)}`, { replace: true });
    }
  }, [location.search, navigate, setCurrentEvent]);

  useEffect(() => {
    if (!currentEvent?.accent) return;
    if (currentEvent.custom) {
      setAppearance({ accent: currentEvent.accent });
    }
  }, [currentEvent?.id, currentEvent?.accent, currentEvent?.custom, setAppearance]);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    EVENT_THEMES.forEach((name) => body.classList.remove(`theme-${name}`));
    if (currentEvent?.theme && currentEvent.theme !== "default") {
      body.classList.add(`theme-${currentEvent.theme}`);
    }

    root.style.setProperty("--accent", appearance.accent || "#22d3ee");
    root.style.setProperty("--accent-two", appearance.accent || "#22d3ee");
    body.classList.toggle("light", theme === "light");
    body.classList.toggle("density-compact", appearance.density === "compact");
    body.classList.toggle("glow-off", appearance.glow === "off");
    body.classList.toggle("custom-background", appearance.backgroundMode === "custom");
    body.classList.toggle(
      "gradient-animation-off",
      appearance.backgroundMode === "custom" && appearance.animation === "off"
    );

    if (appearance.backgroundMode === "custom") {
      root.style.setProperty("--user-background", buildBackground(appearance));
      root.style.setProperty(
        "--gradient-speed",
        appearance.speed === "slow" ? "32s" : appearance.speed === "fast" ? "9s" : "18s"
      );
    } else {
      root.style.removeProperty("--user-background");
      root.style.removeProperty("--gradient-speed");
    }

  return () => EVENT_THEMES.forEach((name) => body.classList.remove(`theme-${name}`));
  }, [currentEvent?.theme, appearance, theme]);

  useEffect(() => {
    const applyCelebrationState = () => {
      if (!currentEvent || !countdown.started || !currentEvent.celebration) {
        setCelebrating(false);
        return;
      }

      const key = `celebrated:${currentEvent.id}`;
      try {
        if (sessionStorage.getItem(key) !== "1") {
          sessionStorage.setItem(key, "1");
          setCelebrating(true);
        } else {
          setCelebrating(false);
        }
      } catch {
        setCelebrating(true);
      }
    };

    const timer = window.setTimeout(applyCelebrationState, 0);
    return () => window.clearTimeout(timer);
  }, [countdown.started, currentEvent]);

  const openTool = useCallback((tool) => {
    if (tool === "share") setModal("share");
    if (tool === "studio") setModal("studio");
    if (tool === "timezone") setModal("timezone");
    if (tool === "cloud") { navigate("/dashboard"); return; }
    if (tool === "history") {
      document.getElementById("myCountdowns")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [navigate, setModal]);

  const createCustomEvent = useCallback((event, shareToken) => {
    const nextEvent = { ...event, shareToken };
    const encoded = shareToken || "";
    navigate(`?custom=${encodeURIComponent(encoded)}`);
    setCurrentEvent(nextEvent);
    window.setTimeout(() => document.querySelector(".countdown-card")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }, [navigate, setCurrentEvent]);

  const platformLinks = <nav className="quick-nav" aria-label="Platform"><Link to="/create">✨ Creator Studio</Link><Link to="/explore">🌐 Explore</Link><Link to="/dashboard">☁️ Dashboard</Link><Link to="/premium">✦ Pro</Link><Link to="/billing">💳 Billing</Link><Link to="/ai">🤖 AI</Link><Link to="/design">🎨 Design</Link><Link to="/share">📤 Share</Link><Link to="/platform">🚀 All Features</Link></nav>;

  return (
    <div className={`${styles.appRoot} antialiased`}>
      <a className={styles.skipLink} href="#eventName">Skip to countdown</a>
      <BackgroundEffects />
      <TopActions />

      <main className="main-container">{platformLinks}
        {currentEvent ? (
          <CountdownCard
            event={currentEvent}
            countdown={countdown}
            nextEvent={nextEvent}
            onReminder={() => setModal("reminder")}
            onShare={() => setModal("share")}
            onCalendar={() => openGoogleCalendar(currentEvent)}
          />
        ) : (
          <section className="countdown-card">
            <div className="event-icon">⚠️</div>
            <p className="eyebrow">COUNTDOWN</p>
            <h1>Unable to load events</h1>
            <p className="event-description">Please check your events configuration and refresh the page.</p>
          </section>
        )}

        <PlatformTools onTool={openTool} />
        <section className="mx-auto my-6 w-full max-w-5xl rounded-2xl border border-white/10 bg-white/[.04] p-5">
          <div className="mb-4 text-center"><span className="eyebrow">COUNTIFY PLATFORM</span><h2 className="mt-1 text-2xl font-bold">Explore everything we built</h2><p className="text-sm text-[var(--muted)]">Pro unlocks limits and advanced capabilities — it does not hide the product.</p></div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {[['🤖','AI Creator','/ai'],['🎨','Design Studio','/design'],['🌐','Explore','/explore'],['📣','Growth & Share','/share'],['🛍️','Theme Marketplace','/marketplace'],['📊','Advanced Analytics','/analytics'],['🏢','Business Teams','/business'],['🧩','Embeds','/embed'],['💳','Billing & Pro','/billing']].map(([icon,label,to])=><Link key={to} to={to} className="rounded-xl border border-white/10 bg-white/[.03] p-3 transition hover:-translate-y-0.5 hover:bg-white/[.06]"><strong>{icon} {label}</strong><span className="mt-1 block text-xs text-[var(--muted)]">Open feature →</span></Link>)}
          </div>
        </section>
        <CreateCountdown onCreated={createCustomEvent} />
        <MyCountdowns onOpen={(event) => {
          const token = event.shareToken;
          if (token) navigate(`?custom=${encodeURIComponent(token)}`);
          setCurrentEvent(event);
        }} />
        <UpcomingEvents events={VALID_EVENTS} currentEvent={currentEvent} nextEvent={nextEvent} now={countdown.now} onSelect={(event) => selectEvent(event, { scroll: true })} />
      </main>

      <ReminderModal event={currentEvent} open={modal === "reminder"} onClose={() => setModal(null)} />
      <ShareModal event={currentEvent} open={modal === "share"} onClose={() => setModal(null)} />
      {modal === "studio" && <AppearanceStudio open onClose={() => setModal(null)} />}
      <TimezoneModal event={currentEvent} open={modal === "timezone"} onClose={() => setModal(null)} />
      <Celebration event={currentEvent} open={celebrating} onClose={() => setCelebrating(false)} />
    </div>
  );
}
