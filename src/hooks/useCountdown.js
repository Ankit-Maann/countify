import { useEffect, useState } from "react";
import { getCountdownParts } from "../utils/countdown";

export function useCountdown(event) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!event) return undefined;

    const interval = window.setInterval(() => setNow(Date.now()), 1000);

    return () => window.clearInterval(interval);
  }, [event]);

  if (!event) {
    return {
      difference: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      started: false,
      now,
    };
  }

  return { ...getCountdownParts(new Date(event.date).getTime(), now), now };
}
