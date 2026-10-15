import { useState } from "react";
import { encodeCustomEvent } from "../../utils/countdown";
import { useCountdownStore } from "../../store/useCountdownStore";

const themes = [
  ["default", "✨", "Classic"],
  ["diwali", "🪔", "Diwali"],
  ["christmas", "🎄", "Christmas"],
  ["holi", "🎨", "Holi"],
  ["newyear", "🎆", "New Year"],
];

export default function CreateCountdown({ onCreated }) {
  const customCountdowns = useCountdownStore((state) => state.customCountdowns);
  const setCustomCountdowns = useCountdownStore((state) => state.setCustomCountdowns);

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("00:00");
  const [emoji, setEmoji] = useState("🎉");
  const [accent, setAccent] = useState("#22d3ee");
  const [description, setDescription] = useState("");
  const [theme, setTheme] = useState("default");
  const [status, setStatus] = useState("");

  const submit = (event) => {
    event.preventDefault();

    if (!name.trim()) return setStatus("Please enter an event name.");
    if (!date) return setStatus("Please select a date.");

    const target = new Date(`${date}T${time || "00:00"}`);
    if (Number.isNaN(target.getTime())) return setStatus("Please enter a valid date and time.");
    if (target.getTime() <= Date.now()) return setStatus("Please choose a future date and time.");

    const customEvent = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      date: `${date}T${time || "00:00"}`,
      icon: emoji.trim() || "🎉",
      theme,
      celebration: null,
      description: description.trim() || `${name.trim()} is almost here! 🎉`,
      accent,
      custom: true,
    };

    const shareToken = encodeCustomEvent(customEvent);
    customEvent.shareToken = shareToken;

    const next = [customEvent, ...customCountdowns.filter((item) => item.id !== customEvent.id)].slice(0, 10);
    setCustomCountdowns(next);

    onCreated(customEvent, shareToken);

    setStatus("✨ Your countdown has been created!");
    setName("");
    setDate("");
    setTime("00:00");
    setEmoji("🎉");
    setAccent("#22d3ee");
    setDescription("");
    setTheme("default");
    window.setTimeout(() => document.getElementById("createCountdown")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  return (
    <section className="create-section" id="createCountdown">
      <div className="section-heading">
        <span className="eyebrow">MAKE IT YOURS</span>
        <h2>Create Your Countdown</h2>
        <p>Create a personalized countdown for any special event.</p>
      </div>

      <div className="create-card">
        <form id="createCountdownForm" onSubmit={submit}>
          <div className="form-group">
            <label htmlFor="customEventName">Event Name</label>
            <input id="customEventName" value={name} onChange={(e) => setName(e.target.value)} placeholder="Birthday, Exam, Trip..." maxLength={60} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="customEventDate">Date</label>
              <input id="customEventDate" type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().slice(0, 10)} required />
            </div>
            <div className="form-group">
              <label htmlFor="customEventTime">Time</label>
              <input id="customEventTime" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="customEventEmoji">Event Emoji</label>
            <div className="emoji-input">
              <input id="customEventEmoji" value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={2} placeholder="🎉" />
              <span id="emojiPreview">{emoji || "🎉"}</span>
            </div>
          </div>

          <div className="form-row advanced-custom-row">
            <div className="form-group">
              <label htmlFor="customAccent">Accent Color</label>
              <div className="color-input-wrap">
                <input id="customAccent" type="color" value={accent} onChange={(e) => setAccent(e.target.value)} aria-label="Countdown accent color" />
                <span id="customAccentValue">{accent.toUpperCase()}</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="customDescription">Short Message</label>
              <input id="customDescription" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={120} placeholder="Something special is coming..." />
            </div>
          </div>

          <div className="form-group">
            <label>Choose a Theme</label>
            <div className="theme-options">
              {themes.map(([id, icon, label]) => (
                <button key={id} type="button" className={`theme-option ${theme === id ? "active" : ""}`} onClick={() => setTheme(id)}>
                  <span>{icon}</span><small>{label}</small>
                </button>
              ))}
            </div>
          </div>

          <button className="create-countdown-btn" id="createCountdownBtn" type="submit">
            <span>✨</span> Create My Countdown
          </button>
        </form>

        <p className="create-status" id="createCountdownStatus" aria-live="polite">{status}</p>
      </div>
    </section>
  );
}
