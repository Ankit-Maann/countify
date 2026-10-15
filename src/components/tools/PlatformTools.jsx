export default function PlatformTools({ onTool }) {
  const tools = [
    ["share", "↗️", "Share", "Send your countdown anywhere"],
    ["studio", "🎨", "Appearance Studio", "Personalize your countdown look"],
    ["history", "🗂️", "My Countdown", "Manage saved events"],
    ["cloud", "☁️", "Cloud Dashboard", "Publish & analytics"],
    ["timezone", "🌍", "Time Zone", "See local event timing"],
  ];

  return (
    <section className="platform-tools" id="platformTools">
      <div className="section-heading">
        <span className="eyebrow">YOUR COUNTDOWN HUB</span>
        <h2>Make Every Moment Count</h2>
        <p>Share, personalize and manage your countdowns in one place.</p>
      </div>

      <div className="tool-grid">
        {tools.map(([id, icon, title, subtitle]) => (
          <button className="tool-card" type="button" key={id} onClick={() => onTool(id)}>
            <span className="tool-icon">{icon}</span>
            <span><strong>{title}</strong><small>{subtitle}</small></span>
          </button>
        ))}
      </div>
    </section>
  );
}
