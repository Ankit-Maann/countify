import { formatEventDateTime, encodeCustomEvent } from "../../utils/countdown";
import { useCountdownStore } from "../../store/useCountdownStore";

export default function MyCountdowns({ onOpen }) {
  const saved = useCountdownStore((state) => state.customCountdowns);
  const setSaved = useCountdownStore((state) => state.setCustomCountdowns);

  if (!saved.length) return null;

  const remove = (id) => {
    const event = saved.find((item) => item.id === id);
    if (!event) return;
    if (!window.confirm(`Delete "${event.name}" from My Countdowns?`)) return;
    setSaved(saved.filter((item) => item.id !== id));
  };

  return (
    <section className="my-countdowns-section" id="myCountdowns">
      <div className="section-heading">
        <span className="eyebrow">YOUR EVENTS</span>
        <h2>My Countdowns</h2>
        <p>Your personalized countdowns are saved here.</p>
      </div>

      <div className="my-countdowns-toolbar">
        <div><strong>Saved locally</strong><span>Up to 10 countdowns on this device</span></div>
        <button type="button" onClick={() => document.getElementById("createCountdown")?.scrollIntoView({ behavior: "smooth" })}>+ New Countdown</button>
      </div>

      <div className="my-countdowns-list" id="myCountdownsList">
        {saved.map((event) => {
          const token = event.shareToken || encodeCustomEvent(event);
          return (
            <article className="my-countdown-card" key={event.id}>
              <div className="my-countdown-card-header">
                <div className="my-countdown-icon">{event.icon || "🎉"}</div>
                <div className="my-countdown-info">
                  <h3>{event.name}</h3>
                  <p>{formatEventDateTime(event.date)}</p>
                </div>
              </div>
              <div className="my-countdown-actions">
                <button className="my-countdown-open" type="button" onClick={() => onOpen({ ...event, shareToken: token })}>Open Countdown</button>
                <button className="my-countdown-delete" type="button" onClick={() => remove(event.id)} aria-label={`Delete ${event.name}`} title="Delete countdown">🗑️</button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
