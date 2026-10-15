import { useEffect } from "react";
import { useCountdownStore } from "../store/useCountdownStore";

export function usePwaInstall() {
  const setDeferredPrompt = useCountdownStore((state) => state.setDeferredPrompt);

  useEffect(() => {
    const onBeforeInstall = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    const onInstalled = () => setDeferredPrompt(null);

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      setDeferredPrompt(null);
    };
  }, [setDeferredPrompt]);
}
