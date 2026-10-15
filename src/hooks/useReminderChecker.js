import { useEffect, useRef } from "react";
import { useCountdownStore } from "../store/useCountdownStore";

function formatReminderTime(minutes) {
  if (minutes === 1440) return "1 day before";
  if (minutes === 60) return "1 hour before";
  if (minutes === 10) return "10 minutes before";
  return `${minutes} minutes before`;
}

export function useReminderChecker() {
  const reminders = useCountdownStore((state) => state.reminders);
  const setReminders = useCountdownStore((state) => state.setReminders);
  const remindersRef = useRef(reminders);

  useEffect(() => {
    remindersRef.current = reminders;
  }, [reminders]);

  useEffect(() => {
    const check = () => {
      const current = remindersRef.current;
      if (!current.length || !("Notification" in window) || Notification.permission !== "granted") return;

      const now = Date.now();
      let changed = false;
      const next = current.map((reminder) => {
        if (reminder.notified || now < reminder.reminderTime || now >= reminder.eventTime) return reminder;

        try {
          const notification = new Notification(`🔔 ${reminder.eventName}`, {
            body: `${formatReminderTime(reminder.minutesBefore)} — your event is coming up!`,
            icon: "/icon-192.png",
            tag: `event-reminder-${reminder.eventId}-${reminder.minutesBefore}`,
            renotify: false,
          });
          notification.onclick = () => {
            window.focus();
            notification.close();
          };
        } catch (error) {
          console.warn("Notification failed:", error);
        }

        changed = true;
        return { ...reminder, notified: true };
      });

      if (changed) setReminders(next);
    };

    check();
    const interval = window.setInterval(check, 30000);
    return () => window.clearInterval(interval);
  }, [setReminders]);
}
