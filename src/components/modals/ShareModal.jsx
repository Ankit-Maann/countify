import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import Modal from "../common/Modal";
import { downloadICS, formatEventDate } from "../../utils/countdown";
import { publicLink } from "../../services/publicLink";
import { trackAnalytics } from "../../services/countdownService";

export default function ShareModal({ event, open, onClose }) {
  const [status, setStatus] = useState("");
  const canvasRef = useRef(null);
  const link = useMemo(() => event ? publicLink(event) : window.location.href, [event]);

  useEffect(() => {
    if (!open || !link || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, `${link}${link.includes("?") ? "&" : "?"}ref=qr`, { width: 210, margin: 2, errorCorrectionLevel: "M" }).catch(() => setStatus("QR code could not be generated."));
  }, [open, link]);

  const text = event
    ? `${event.icon || "⏳"} ${event.name}\n${event.description || "A special moment is coming!"}\n${formatEventDate(event.date)}\n\nCountdown: ${link}`
    : link;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setStatus("🔗 Public countdown link copied!");
      if (event?.cloudId) trackAnalytics({ countdownId: event.cloudId, eventType: "share" });
    } catch {
      setStatus("Could not copy the link.");
    }
  };

  const share = async () => {
    if (event?.cloudId) trackAnalytics({ countdownId: event.cloudId, eventType: "share" });
    if (navigator.share) {
      try {
        await navigator.share({ title: event?.name || "Countdown", text, url: link });
        setStatus("Shared successfully.");
      } catch (error) {
        if (error?.name !== "AbortError") setStatus("Share cancelled or unavailable.");
      }
    } else {
      await copy();
    }
  };

  const external = (type) => {
    if (event?.cloudId) trackAnalytics({ countdownId: event.cloudId, eventType: "share" });
    const encoded = encodeURIComponent(text);
    const urls = {
      whatsapp: `https://wa.me/?text=${encoded}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(event?.name || "Countdown")}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
    };
    window.open(urls[type], "_blank", "noopener,noreferrer");
  };

  const downloadQr = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `${(event?.name || "countdown").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-qr.png`;
    a.click();
  };

  return (
    <Modal open={open} onClose={onClose} className="share-modal-content" id="shareModal" labelledBy="shareModalTitle">
      <button className="modal-close" id="shareModalClose" type="button" onClick={onClose} aria-label="Close share center">×</button>
      <div className="modal-icon">↗️</div>
      <p className="eyebrow">SHARE THE MOMENT</p>
      <h2 id="shareModalTitle">{event ? `Share ${event.name}` : "Share Countdown"}</h2>
      <p className="modal-subtitle" id="shareModalText">{event?.description || "Send this countdown to your friends."}</p>
      <div className="share-preview" id="sharePreview"><strong>{event?.icon || "⏳"} {event?.name || "Countdown"}</strong><span>{event ? formatEventDate(event.date) : "—"}</span></div>

      <div className="share-grid">
        <button className="share-option" type="button" onClick={share}><span>📤</span><strong>Share</strong><small>Device share</small></button>
        <button className="share-option" type="button" onClick={copy}><span>🔗</span><strong>Copy Link</strong><small>Public URL</small></button>
        <button className="share-option" type="button" onClick={() => external("whatsapp")}><span>💬</span><strong>WhatsApp</strong><small>Send message</small></button>
        <button className="share-option" type="button" onClick={() => external("telegram")}><span>✈️</span><strong>Telegram</strong><small>Send message</small></button>
        <button className="share-option" type="button" onClick={() => external("facebook")}><span>📘</span><strong>Facebook</strong><small>Share link</small></button>
        <button className="share-option" type="button" onClick={() => event && downloadICS(event)}><span>📅</span><strong>Calendar</strong><small>Download .ics</small></button>
      </div>

      <div className="share-link-row">
        <input id="shareLinkInput" value={link} readOnly aria-label="Countdown share link" />
        <button id="shareCopyBtn" type="button" onClick={copy}>Copy</button>
      </div>

      <div className="qr-share-box">
        <canvas ref={canvasRef} aria-label="Countdown QR code" />
        <div><strong>Scan to open</strong><span>Share this QR with anyone.</span><button type="button" className="event-action" onClick={downloadQr}>Save QR</button></div>
      </div>

      <p className="share-status" id="shareCenterStatus" aria-live="polite">{status}</p>
    </Modal>
  );
}
