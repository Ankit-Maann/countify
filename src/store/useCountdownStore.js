import { create } from "zustand";
import { readStorage, writeStorage, readText, writeText } from "../utils/storage";

export const DEFAULT_APPEARANCE = {
  preset: "aurora",
  backgroundMode: "default",
  type: "linear",
  angle: 120,
  colors: ["#0f172a", "#312e81", "#164e63"],
  animation: "on",
  speed: "normal",
  density: "comfortable",
  glow: "on",
  accent: "#22d3ee",
};

export const APPEARANCE_PRESETS = {
  aurora: { type: "linear", angle: 120, colors: ["#0f172a", "#312e81", "#164e63"], speed: "normal" },
  sunset: { type: "linear", angle: 125, colors: ["#1e1b4b", "#7c2d12", "#f97316"], speed: "slow" },
  ocean: { type: "linear", angle: 135, colors: ["#082f49", "#0e7490", "#06b6d4"], speed: "normal" },
  candy: { type: "linear", angle: 120, colors: ["#3b0764", "#be185d", "#fb7185"], speed: "normal" },
  midnight: { type: "radial", angle: 180, colors: ["#020617", "#111827", "#312e81"], speed: "slow" },
  forest: { type: "linear", angle: 145, colors: ["#052e16", "#166534", "#0f766e"], speed: "slow" },
};

const storedAppearance = readStorage("countdownAppearance", {});
const initialAppearance = {
  ...DEFAULT_APPEARANCE,
  ...storedAppearance,
  colors:
    Array.isArray(storedAppearance?.colors) && storedAppearance.colors.length === 3
      ? storedAppearance.colors
      : [...DEFAULT_APPEARANCE.colors],
};

const storedCustomCountdowns = readStorage("customCountdowns", []);
const storedReminders = readStorage("eventCountdownReminders", []);

export const useCountdownStore = create((set) => ({
  currentEvent: null,
  view: "time",
  theme: readText("countdown-theme", "dark") === "light" ? "light" : "dark",
  appearance: initialAppearance,
  customCountdowns: Array.isArray(storedCustomCountdowns) ? storedCustomCountdowns.filter(Boolean).slice(0, 10) : [],
  reminders: Array.isArray(storedReminders) ? storedReminders.filter(Boolean) : [],
  modal: null,
  shareMessage: "",
  deferredPrompt: null,

  setCurrentEvent: (currentEvent) => set({ currentEvent }),
  setView: (view) => set({ view: view === "days" ? "days" : "time" }),
  setTheme: (theme) => {
    const nextTheme = theme === "light" ? "light" : "dark";
    writeText("countdown-theme", nextTheme);
    set({ theme: nextTheme });
  },
  setAppearance: (appearance) => set((state) => {
    const next = {
      ...state.appearance,
      ...appearance,
      colors: Array.isArray(appearance?.colors)
        ? appearance.colors.slice(0, 3)
        : state.appearance.colors,
    };
    writeStorage("countdownAppearance", next);
    return { appearance: next };
  }),
  resetAppearance: () => {
    const next = { ...DEFAULT_APPEARANCE, colors: [...DEFAULT_APPEARANCE.colors] };
    writeStorage("countdownAppearance", next);
    set({ appearance: next });
  },
  setCustomCountdowns: (customCountdowns) => set(() => {
    const next = Array.isArray(customCountdowns) ? customCountdowns.filter(Boolean).slice(0, 10) : [];
    writeStorage("customCountdowns", next);
    return { customCountdowns: next };
  }),
  updateCustomCountdown: (id, patch) => set((state) => {
    const next = state.customCountdowns.map((item) => item.id === id ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item);
    writeStorage("customCountdowns", next);
    return { customCountdowns: next };
  }),
  removeCustomCountdown: (id) => set((state) => {
    const next = state.customCountdowns.filter((item) => item.id !== id);
    writeStorage("customCountdowns", next);
    return { customCountdowns: next };
  }),
  setReminders: (reminders) => set(() => {
    const next = Array.isArray(reminders) ? reminders.filter(Boolean) : [];
    writeStorage("eventCountdownReminders", next);
    return { reminders: next };
  }),
  setModal: (modal) => set({ modal }),
  setShareMessage: (shareMessage) => set({ shareMessage }),
  setDeferredPrompt: (deferredPrompt) => set({ deferredPrompt }),
}));
