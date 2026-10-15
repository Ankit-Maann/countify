import { formatEventDate, eventTime } from "../../utils/countdown";

export default function UpcomingEvents({ events, currentEvent, nextEvent, onSelect, now = 0 }) {
  const upcoming = events
    .filter((event) => eventTime(event) > now)
    .sort((a, b) => eventTime(a) - eventTime(b))
    .slice(0, 6);

  return (
    <section className="upcoming-section">
      <div className="section-heading">
        <p className="eyebrow">WHAT'S NEXT</p>
        <h2>Upcoming Events</h2>
        <p>Never miss an important day.</p>
      </div>

      <div className="events-grid" id="eventsGrid">
        {upcoming.length === 0 ? (
          <div className="event-card">
            <h3>No upcoming events</h3>
            <p className="event-card-date">There are no upcoming events right now.</p>
          </div>
        ) : (
          upcoming.map((event) => {
            const days = Math.ceil((eventTime(event) - now) / 86400000);
            const selected = currentEvent?.id === event.id;
            const isNext = nextEvent?.id === event.id;

            return (
              <article className={`event-card ${selected ? "selected" : ""}`} key={event.id}>
                {isNext && <div className="next-card-badge">⭐ NEXT EVENT</div>}
                <div className="event-card-icon">{event.icon}</div>
                <h3>{event.name}</h3>
                <p className="event-card-date">{formatEventDate(event.date)}</p>
                <div className="event-card-days">{days}<span>days</span></div>
                <button className="event-card-btn" type="button" onClick={() => onSelect(event)}>
                  {selected ? "Selected ✓" : "View Countdown →"}
                </button>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
