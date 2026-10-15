import Modal from "../common/Modal";
import { formatEventDateTime } from "../../utils/countdown";

export default function TimezoneModal({ event, open, onClose }) {
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local time";

  return (
    <Modal open={open} onClose={onClose} className="timezone-modal-content" id="timezoneModal" labelledBy="timezoneTitle">
      <button className="modal-close" id="timezoneClose" type="button" onClick={onClose} aria-label="Close timezone details">×</button>
      <div className="modal-icon">🌍</div>
      <p className="eyebrow">TIME AWARE</p>
      <h2 id="timezoneTitle">Event Time Zone</h2>
      <p id="timezoneEventName">{event ? `${event.icon || "⏳"} ${event.name}` : "Current countdown"}</p>
      <div className="timezone-cards">
        <div><span>Your time zone</span><strong>{zone}</strong></div>
        <div><span>Event time</span><strong>{event ? formatEventDateTime(event.date) : "—"}</strong></div>
      </div>
      <p className="modal-note">Shared countdown links use the recipient's local clock for the event time. This keeps the countdown useful across devices and countries.</p>
    </Modal>
  );
}
