import { useCallback } from "react";
import { useCountdownStore } from "../../store/useCountdownStore";
import { usePwaInstall } from "../../hooks/usePwaInstall";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import { APP_VERSION } from "../../config/appVersion";

export default function TopActions() {
  usePwaInstall();

  const theme = useCountdownStore((state) => state.theme);
  const setTheme = useCountdownStore((state) => state.setTheme);
  const deferredPrompt = useCountdownStore((state) => state.deferredPrompt);
  const setDeferredPrompt = useCountdownStore((state) => state.setDeferredPrompt);
  const setShareMessage = useCountdownStore((state) => state.setShareMessage);
  const online = useOnlineStatus();

  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  const install = useCallback(async () => {
    if (!deferredPrompt) {
      setShareMessage("📲 Install is available when supported by your browser.");
      window.setTimeout(() => setShareMessage(""), 2500);
      return;
    }

    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
    } catch {
      // User cancelled or browser rejected the prompt.
    } finally {
      setDeferredPrompt(null);
    }
  }, [deferredPrompt, setDeferredPrompt, setShareMessage]);

  return (
    <div className="top-actions" aria-label={`Countdown controls, version ${APP_VERSION}`}>
      <button
        className="icon-btn"
        id="themeBtn"
        type="button"
        aria-label="Toggle theme"
        onClick={toggleTheme}
      >
        {theme === "light" ? "☀️" : "🌙"}
      </button>

      <span className="sr-only">Version {APP_VERSION}. {online ? "Online" : "Offline"}</span>

      {deferredPrompt && (
        <button
          className="icon-btn"
          id="installBtn"
          type="button"
          aria-label="Install app"
          onClick={install}
        >
          📲
        </button>
      )}
    </div>
  );
}
