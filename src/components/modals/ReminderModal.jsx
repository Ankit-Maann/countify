import { useState } from "react";
import Modal from "../common/Modal";
import { useCountdownStore } from "../../store/useCountdownStore";

const nowMs = () => Date.now();

const options = [
  [1440, "1 Day Before", "24 hours before"],
  [60, "1 Hour Before", "60 minutes before"],
  [10, "10 Minutes Before", "10 minutes before"],
];

export default function ReminderModal({ event, open, onClose }) {
  const reminders = useCountdownStore((state) => state.reminders);
  const setReminders = useCountdownStore((state) => state.setReminders);
  const [status, setStatus] = useState("");

  const setReminder = async (minutes) => {
    if (!event) return;
    const eventTime = new Date(event.date).getTime();
    const reminderTime = eventTime - minutes * 60000;

    if (reminderTime <= nowMs()) {
      setStatus("This reminder time has already passed.");
      return;
    }

    if (!("Notification" in window)) {
      setStatus("Notifications are not supported in this browser.");
      return;
    }

    const permission =
      Notification.permission === "default"
        ? await Notification.requestPermission()
        : Notification.permission;

    if (permission !== "granted") {
      setStatus("Notification permission was denied. Please enable it in browser settings.");
      return;
    }

    const next = [
      ...reminders.filter((item) => item.eventId !== event.id),
      {
        eventId: event.id,
        eventName: event.name,
        eventTime,
        reminderTime,
        minutesBefore: minutes,
        notified: false,
        createdAt: nowMs(),
      },
    ];

    setReminders(next);
    setStatus(`Reminder set for ${minutes === 1440 ? "1 day before" : minutes === 60 ? "1 hour before" : "10 minutes before"}.`);
  };

  return (
    <Modal open={open} onClose={onClose} id="reminderModal" labelledBy="reminder-title">
      <button className="modal-close" id="reminderClose" type="button" onClick={onClose} aria-label="Close">×</button>
      <div className="modal-icon">🔔</div>
      <h2 id="reminder-title">Set Reminder</h2>
      <p id="reminderEventName">{event ? event.name : "Get notified before the event starts."}</p>

      <div className="reminder-options">
        {options.map(([minutes, title, subtitle]) => (
          <button className="reminder-option" type="button" key={minutes} onClick={() => setReminder(minutes)}>
            <strong>{title}</strong><span>{subtitle}</span>
          </button>
        ))}
      </div>
      <p className="reminder-status" id="reminderStatus" aria-live="polite">{status}</p>
    </Modal>
  );
}
