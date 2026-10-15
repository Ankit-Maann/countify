import { useCallback, useMemo, useState } from "react";
import Modal from "../common/Modal";
import {
  APPEARANCE_PRESETS,
  DEFAULT_APPEARANCE,
  useCountdownStore,
} from "../../store/useCountdownStore";
import { buildBackground } from "../../utils/countdown";

const presetLabels = [
  ["aurora", "Aurora"],
  ["sunset", "Sunset"],
  ["ocean", "Ocean"],
  ["candy", "Candy"],
  ["midnight", "Midnight"],
  ["forest", "Forest"],
  ["custom", "Custom"],
];

export default function AppearanceStudio({ open, onClose }) {
  const appearance = useCountdownStore((state) => state.appearance);
  const setAppearance = useCountdownStore((state) => state.setAppearance);
  const resetAppearance = useCountdownStore((state) => state.resetAppearance);
  const [draft, setDraft] = useState(appearance);


  const background = useMemo(() => buildBackground(draft), [draft]);

  const patch = (value) => {
    setDraft((current) => {
      const next = { ...current, ...value };
      const root = document.documentElement;
      const body = document.body;

      root.style.setProperty("--accent", next.accent);
      root.style.setProperty("--accent-two", next.accent);
      body.classList.toggle("density-compact", next.density === "compact");
      body.classList.toggle("glow-off", next.glow === "off");
      body.classList.toggle("custom-background", next.backgroundMode === "custom");
      body.classList.toggle(
        "gradient-animation-off",
        next.backgroundMode === "custom" && next.animation === "off"
      );

      if (next.backgroundMode === "custom") {
        root.style.setProperty("--user-background", buildBackground(next));
        root.style.setProperty(
          "--gradient-speed",
          next.speed === "slow" ? "32s" : next.speed === "fast" ? "9s" : "18s"
        );
      }

      return next;
    });
  };

  const choosePreset = (name) => {
    if (name === "custom") {
      patch({ preset: "custom", backgroundMode: "custom" });
      return;
    }
    patch({ ...APPEARANCE_PRESETS[name], preset: name, backgroundMode: "custom" });
  };

  const closeWithoutSaving = useCallback(() => {
    setDraft(appearance);
    setAppearance(appearance);
    onClose();
  }, [appearance, onClose, setAppearance]);

  const save = () => {
    setAppearance(draft);
    onClose();
  };

  const reset = () => {
    resetAppearance();
    setDraft(DEFAULT_APPEARANCE);
  };

  return (
    <Modal open={open} onClose={closeWithoutSaving} className="studio-modal-content" id="studioModal" labelledBy="studioTitle">
      <button className="modal-close" id="studioClose" type="button" onClick={closeWithoutSaving} aria-label="Close appearance studio">×</button>
      <div className="modal-icon">🎨</div>
      <p className="eyebrow">PREMIUM CUSTOMIZATION</p>
      <h2 id="studioTitle">Appearance Studio</h2>
      <p className="modal-subtitle">Tune the current countdown without changing its event data.</p>

      <div className="studio-section-title"><span>Background</span><small>Make the entire page yours</small></div>

      <div className="studio-group">
        <label>Gradient presets</label>
        <div className="studio-preset-grid">
          {presetLabels.map(([id, label]) => (
            <button key={id} type="button" className={`studio-preset ${draft.preset === id ? "active" : ""}`} onClick={() => choosePreset(id)}>
              <span className={`preset-swatch swatch-${id}`} />
              <strong>{label}</strong>
            </button>
          ))}
        </div>
      </div>

      <div className="studio-group">
        <label>Gradient type</label>
        <div className="studio-pills">
          <button type="button" className={draft.type === "linear" ? "active" : ""} onClick={() => patch({ type: "linear", preset: "custom", backgroundMode: "custom" })}>Linear</button>
          <button type="button" className={draft.type === "radial" ? "active" : ""} onClick={() => patch({ type: "radial", preset: "custom", backgroundMode: "custom" })}>Radial</button>
        </div>
      </div>

      <div className="studio-color-grid">
        {[0, 1, 2].map((index) => (
          <label className="studio-color-control" key={index}>
            <span>Color {index + 1}</span>
            <input
              type="color"
              value={draft.colors[index]}
              onChange={(e) => {
                const colors = [...draft.colors];
                colors[index] = e.target.value;
                patch({ colors, preset: "custom", backgroundMode: "custom" });
              }}
              aria-label={`Background color ${index + 1}`}
            />
          </label>
        ))}
      </div>

      <div className="studio-group studio-angle-group">
        <div className="studio-range-head"><label htmlFor="studioAngle">Gradient angle</label><output>{draft.angle}°</output></div>
        <input id="studioAngle" type="range" min="0" max="360" value={draft.angle} onChange={(e) => patch({ angle: Number(e.target.value), preset: "custom", backgroundMode: "custom" })} />
      </div>

      <div className="studio-preview" style={{ background }}>
        <span>LIVE PREVIEW</span><strong>Your background</strong>
      </div>

      <div className="studio-group">
        <label>Gradient animation</label>
        <div className="studio-pills">
          <button type="button" className={draft.animation === "on" ? "active" : ""} onClick={() => patch({ animation: "on", backgroundMode: "custom" })}>On</button>
          <button type="button" className={draft.animation === "off" ? "active" : ""} onClick={() => patch({ animation: "off", backgroundMode: "custom" })}>Off</button>
        </div>
      </div>

      <div className="studio-group">
        <label>Animation speed</label>
        <div className="studio-pills">
          {["slow", "normal", "fast"].map((speed) => (
            <button key={speed} type="button" className={draft.speed === speed ? "active" : ""} onClick={() => patch({ speed, animation: "on", backgroundMode: "custom" })}>{speed[0].toUpperCase() + speed.slice(1)}</button>
          ))}
        </div>
      </div>

      <div className="studio-divider" />

      <div className="studio-section-title"><span>Interface</span><small>Fine-tune the countdown itself</small></div>

      <div className="studio-group">
        <label htmlFor="studioAccent">Accent</label>
        <div className="color-input-wrap">
          <input id="studioAccent" type="color" value={draft.accent} onChange={(e) => patch({ accent: e.target.value })} />
          <span>{draft.accent.toUpperCase()}</span>
        </div>
      </div>

      <div className="studio-group">
        <label>Display density</label>
        <div className="studio-pills">
          <button type="button" className={draft.density === "comfortable" ? "active" : ""} onClick={() => patch({ density: "comfortable" })}>Comfortable</button>
          <button type="button" className={draft.density === "compact" ? "active" : ""} onClick={() => patch({ density: "compact" })}>Compact</button>
        </div>
      </div>

      <div className="studio-group">
        <label>Background glow</label>
        <div className="studio-pills">
          <button type="button" className={draft.glow === "on" ? "active" : ""} onClick={() => patch({ glow: "on" })}>On</button>
          <button type="button" className={draft.glow === "off" ? "active" : ""} onClick={() => patch({ glow: "off" })}>Off</button>
        </div>
      </div>

      <div className="studio-actions">
        <button className="action-btn" type="button" onClick={reset}>Reset Appearance</button>
        <button className="create-countdown-btn" type="button" onClick={save}>Save &amp; Done</button>
      </div>
    </Modal>
  );
}
