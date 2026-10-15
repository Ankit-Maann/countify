import { useEffect, useState } from "react";

export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState({ navigation: null, paint: null, memory: null });

  useEffect(() => {
    if (typeof window === "undefined" || !window.performance) return undefined;
    const update = () => {
      const navigation = window.performance.getEntriesByType?.("navigation")?.[0];
      const paint = window.performance.getEntriesByType?.("paint") || [];
      const firstContentful = paint.find((entry) => entry.name === "first-contentful-paint");
      const memory = window.performance.memory;
      setMetrics({
        navigation: navigation ? Math.round(navigation.loadEventEnd || navigation.duration || 0) : null,
        paint: firstContentful ? Math.round(firstContentful.startTime) : null,
        memory: memory ? Math.round(memory.usedJSHeapSize / 1024 / 1024) : null,
      });
    };
    const id = window.setTimeout(update, 250);
    return () => window.clearTimeout(id);
  }, []);

  return metrics;
}
