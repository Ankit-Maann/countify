import { useCallback } from "react";
import { useCountdownStore } from "../../store/useCountdownStore";
import { formatEventDate, pad2 } from "../../utils/countdown";

export default function CountdownCard({
  event,
  countdown,
  nextEvent,
  onReminder,
  onShare,
  onCalendar,
}) {
  const view = useCountdownStore((state) => state.view);
  const setView = useCountdownStore((state) => state.setView);
  const shareMessage = useCountdownStore((state) => state.shareMessage);

  const isNext = Boolean(event && nextEvent && event.id === nextEvent.id && !countdown.started);
  const design = event?.design || {};
  const fontFamily = {
    sans: "Inter, system-ui, sans-serif",
    serif: "Georgia, serif",
    mono: "ui-monospace, SFMono-Regular, monospace",
    display: "Impact, Haettenschweiler, sans-serif",
  }[design.font || "sans"];
  const cardStyle = {
    fontFamily,
    borderRadius: `${design.radius || 24}px`,
    ...(event?.imageUrl ? {
      backgroundImage: `linear-gradient(rgba(4,8,20,${Math.min(0.8, Math.max(0.05, Number(design.overlay ?? 35) / 100))}),rgba(4,8,20,${Math.min(0.8, Math.max(0.05, Number(design.overlay ?? 35) / 100))})), url(${event.imageUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    } : {}),
  };

  const selectView = useCallback((next) => setView(next), [setView]);

  return (
    <section className={`countdown-card ${design.animation === "off" ? "motion-reduced" : ""}`} style={cardStyle}>
      <div className="event-icon" id="eventIcon">{event?.icon || "🎉"}</div>

      <p className="eyebrow">COUNTDOWN</p>

      <div className={`next-event-badge ${isNext ? "" : "hidden"}`} id="nextEventBadge">
        ⭐ NEXT EVENT
      </div>

      <h1 id="eventName">{event?.name || "Countdown"}</h1>

      <p className="event-description" id="eventDescription">
        {countdown.started
          ? `${event?.name || "This event"} is here! 🎉`
          : event?.description || "A special moment is coming!"}
      </p>

      <div className="view-switcher">
        <button
          className={`view-btn ${view === "time" ? "active" : ""}`} id="timeViewBtn"
          type="button"
          onClick={() => selectView("time")}
        >
          ⏱ Time
        </button>
        <button
          className={`view-btn ${view === "days" ? "active" : ""}`} id="daysViewBtn"
          type="button"
          onClick={() => selectView("days")}
        >
          📅 Days
        </button>
      </div>

      <section
        className={`countdown ${view === "days" ? "hidden" : ""}`} id="timeCountdown"
        aria-label="Time remaining"
      >
        <div className="time-box"><strong id="days">{pad2(countdown.days)}</strong><span>Days</span></div>
        <div className="separator">:</div>
        <div className="time-box"><strong id="hours">{pad2(countdown.hours)}</strong><span>Hours</span></div>
        <div className="separator">:</div>
        <div className="time-box"><strong id="minutes">{pad2(countdown.minutes)}</strong><span>Minutes</span></div>
        <div className="separator">:</div>
        <div className="time-box"><strong id="seconds">{pad2(countdown.seconds)}</strong><span>Seconds</span></div>
      </section>

      <section
        className={`days-countdown ${view === "time" ? "hidden" : ""}`} id="daysCountdown"
        aria-label="Days remaining"
      >
        <strong id="totalDays">{countdown.days}</strong>
        <span>Days Remaining</span>
      </section>

      <div className="event-date">
        <span>Event Date</span>
        <strong id="formattedDate">{event ? formatEventDate(event.date) : "Loading..."}</strong>
      </div>

      <div className="event-actions">
        <button className="event-action" id="reminderBtn" aria-label="Set reminder" type="button" onClick={onReminder}>
          🔔 Set Reminder
        </button>
        <button className="action-btn" id="shareBtn" type="button" onClick={onShare}>
          🔗 Share
        </button>
        <button className="action-btn" id="calendarBtn" type="button" onClick={onCalendar}>
          📅 Calendar
        </button>
      </div>

      <p className={`share-message ${shareMessage ? "show" : ""}`} id="shareMessage" aria-live="polite">
        {shareMessage}
      </p>

      <p className="footer-text">Time is ticking... ⏳</p>
    </section>
  );
}
