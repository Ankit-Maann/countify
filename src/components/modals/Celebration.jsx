import { useMemo } from "react";

const symbols = {
  diwali: ["🪔", "✨", "🌟"],
  christmas: ["🎄", "🎁", "❄️", "✨"],
  winter: ["❄️", "❄️", "✨", "☃️"],
  newyear: ["🎉", "✨", "🎊", "⭐"],
  holi: ["🎨", "🩷", "💙", "💛", "💚"],
};

function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededValue(seed) {
  let value = seed || 1;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  return (value >>> 0) / 4294967296;
}

function createParticles(event) {
  if (!event?.celebration) return [];
  const pool = symbols[event.celebration] || ["🎉", "✨", "🎊", "⭐"];
  const amount = event.celebration === "newyear" || event.celebration === "holi" ? 55 : 45;
  const baseSeed = hashString(`${event.id}:${event.celebration}`);

  return Array.from({ length: amount }, (_, index) => {
    const seed = baseSeed + index * 2654435761;
    const symbolValue = seededValue(seed);
    const left = seededValue(seed + 1);
    const size = seededValue(seed + 2);
    const duration = seededValue(seed + 3);
    const delay = seededValue(seed + 4);
    const rotate = seededValue(seed + 5);
    return {
      id: `${event.id}-${index}`,
      symbol: pool[Math.floor(symbolValue * pool.length)],
      left: left * 100,
      size: size * 18 + 14,
      duration: duration * 3 + 2.5,
      delay: delay * 0.8,
      rotate: rotate * 720,
    };
  });
}

export default function Celebration({ event, open, onClose }) {
  const particles = useMemo(() => createParticles(event), [event]);

  if (!open || !event) return null;

  return (
    <>
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="celebration-particle"
          style={{
            left: `${particle.left}%`,
            top: "-30px",
            fontSize: `${particle.size}px`,
            animation: `reactConfetti ${particle.duration}s cubic-bezier(.2,.8,.3,1) ${particle.delay}s forwards`,
            "--rotate": `${particle.rotate}deg`,
          }}
        >
          {particle.symbol}
        </span>
      ))}

      <div className="celebration" role="dialog" aria-modal="true" aria-labelledby="celebrationTitle" onMouseDown={(e) => e.currentTarget === e.target && onClose()}>
        <div className="celebration-content">
          <div className="celebration-icon">🎉</div>
          <p className="eyebrow">THE WAIT IS OVER</p>
          <h2 id="celebrationTitle">{event.name}</h2>
          <p id="celebrationText">{event.name} has started! 🎉</p>
          <button className="celebration-close" id="celebrationClose" type="button" onClick={onClose}>Let's Celebrate 🎊</button>
        </div>
      </div>
    </>
  );
}
