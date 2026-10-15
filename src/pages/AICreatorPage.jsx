import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mic, MicOff, Sparkles, Trash2, WandSparkles } from "lucide-react";
import BackgroundEffects from "../components/layout/BackgroundEffects";
import PlatformNav from "../components/layout/PlatformNav";
import styles from "../styles/features/FeaturePage.module.css";
import { createWithAi, getAiMemory, loadAiChat, saveAiChat, saveAiMemory, clearAiMemory, persistAiConversationMessage } from "../services/aiCreatorService";
import { encodeCustomEvent } from "../utils/countdown";
import { validateCountdown } from "../utils/security";
import { useCountdownStore } from "../store/useCountdownStore";

const examples = [
  "meri sister ki anniversary 12 november ko hai, beautiful romantic countdown bana de",
  "Bhai mera exam 10 December 2026 ko hai. Isko midnight theme me kar do",
  "Mummy ka birthday next year 5 March hai, cute pink design rakhna",
  "Christmas tak ka countdown bana do aur reminder bhi suggest karo",
  "Is countdown ka naam 'My Big Day' kar do and emoji 🎉 kar do",
];

function uid() { return globalThis.crypto?.randomUUID?.() || `ai-${Date.now()}-${Math.random().toString(36).slice(2)}`; }
function formatDate(value) { try { return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }); } catch { return value; } }

export default function AICreatorPage() {
  const navigate = useNavigate();
  const custom = useCountdownStore((s) => s.customCountdowns);
  const setCustom = useCountdownStore((s) => s.setCustomCountdowns);
  const updateCustom = useCountdownStore((s) => s.updateCustomCountdown);
  const removeCustom = useCountdownStore((s) => s.removeCustomCountdown);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState(loadAiChat);
  const [result, setResult] = useState(null);
  const [selectedId, setSelectedId] = useState("");
  const [memory, setMemory] = useState(getAiMemory);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => { saveAiChat(messages); }, [messages]);
  useEffect(() => () => recognitionRef.current?.stop?.(), []);

  const selectedCountdown = useMemo(() => custom.find((x) => x.id === selectedId) || null, [custom, selectedId]);
  const preview = result || selectedCountdown;



  const startVoice = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) { setStatus("Voice input is not supported by this browser. You can still type naturally."); return; }
    if (listening) { recognitionRef.current?.stop(); return; }
    const recognition = new Recognition(); recognition.lang = "hi-IN"; recognition.interimResults = true; recognition.continuous = false;
    recognition.onstart = () => setListening(true);
    recognition.onresult = (event) => { const transcript = Array.from(event.results).map((r) => r[0]?.transcript || "").join(" "); setPrompt(transcript); };
    recognition.onerror = () => { setListening(false); setStatus("Voice input stopped. Try again or type your request."); };
    recognition.onend = () => setListening(false); recognitionRef.current = recognition; recognition.start();
  };

  const executeActions = (actions = [], aiResult = null) => {
    let nextResult = aiResult || null;
    for (const action of actions) {
      const type = action?.type;
      const args = action?.arguments || {};
      if (type === "delete_countdown" && action?.requiresConfirmation) {
        if (window.confirm(`Delete “${selectedCountdown?.name || "this countdown"}”? This cannot be undone.`)) {
          action.arguments = { ...args, confirmed: true };
        } else {
          continue;
        }
      }
      if (type === "create_countdown" && nextResult) {
        const item = { ...nextResult, ...args, id: `custom-${uid()}`, custom: true, celebration: null, createdAt: new Date().toISOString() };
        item.shareToken = encodeCustomEvent(item); setCustom([item, ...custom].slice(0, 10)); setSelectedId(item.id); nextResult = item;
      }
      if (type === "update_countdown" && selectedCountdown) {
        updateCustom(selectedCountdown.id, { ...args }); nextResult = { ...selectedCountdown, ...args };
      }
      if (type === "delete_countdown" && selectedCountdown && args.confirmed === true) { removeCustom(selectedCountdown.id); setSelectedId(""); nextResult = null; }
      if (type === "open_countdown" && (args.id || selectedCountdown?.id)) navigate(`/?custom=${encodeURIComponent(args.shareToken || selectedCountdown?.shareToken || "")}`);
      if (type === "set_memory") setMemory(saveAiMemory(args));
    }
    return nextResult;
  };

  const generate = async (value = prompt) => {
    const text = value.trim(); if (!text || busy) return;
    setPrompt(""); setBusy(true); setStatus("");
    const userMessage = { id: uid(), role: "user", text, createdAt: Date.now() };
    const nextMessages = [...messages, userMessage]; setMessages(nextMessages);
    await persistAiConversationMessage(userMessage, { title: "Countify AI 4.0 session" });
    try {
      const response = await createWithAi(text, nextMessages.map((m) => ({ role: m.role, text: m.text })), {
        selectedCountdown: selectedCountdown ? { id: selectedCountdown.id, name: selectedCountdown.name, date: selectedCountdown.date, theme: selectedCountdown.theme, accent: selectedCountdown.accent } : null,
        capabilities: ["memory", "actions", "date-intelligence", "visual-design", "multilingual", "voice", "copilot"],
      });
      const nextResult = executeActions(response.actions || [], response.result);
      if (response.memory) setMemory(saveAiMemory(response.memory));
      if (nextResult) setResult(nextResult);
      const reply = response.reply || (nextResult ? `Done ✨ ${nextResult.name} is set for ${formatDate(nextResult.date)}.` : "I understood you. What should I change next?");
      const assistantMessage = { id: uid(), role: "assistant", text: reply, createdAt: Date.now(), metadata: { actions: response.actions || [] } };
      setMessages((items) => [...items, assistantMessage]);
      await persistAiConversationMessage(assistantMessage, { title: "Countify AI 4.0 session" });
      setStatus(response.source === "ai-endpoint" ? "✨ AI Creator 4.0 copilot is active." : "✨ Offline smart mode is active. Connect the AI endpoint for the full copilot.");
    } catch (error) {
      setMessages((items) => [...items, { id: uid(), role: "assistant", text: error.message || "I couldn't complete that request.", createdAt: Date.now() }]);
      setStatus(error.message || "Could not complete the request.");
    } finally { setBusy(false); }
  };

  const createPreview = () => {
    if (!preview) return;
    try {
      const valid = validateCountdown({ ...preview, date: preview.date });
      const item = { ...valid, id: preview.id || `custom-${uid()}`, custom: true, celebration: null, createdAt: preview.createdAt || new Date().toISOString() };
      item.shareToken = encodeCustomEvent(item);
      const without = custom.filter((x) => x.id !== item.id); setCustom([item, ...without].slice(0, 10)); setSelectedId(item.id); setResult(item); navigate(`/?custom=${encodeURIComponent(item.shareToken)}`);
    } catch (error) { setStatus(error.message || "Could not save countdown."); }
  };

  const clearConversation = () => { clearAiMemory(); setMemory({}); setMessages([]); setResult(null); setStatus("AI memory and local chat cleared."); };

  return <div><BackgroundEffects /><main className={`main-container ai-page ${styles.page} mx-auto w-full max-w-[1100px]`}><PlatformNav />
    <section className="section-heading text-center"><span className="eyebrow">AI CREATOR 4.0 • FULL COUNTDOWN COPILOT</span><h1>Talk to your countdown.</h1><p>English, Hindi, Hinglish, voice, follow-up edits, dates, design, memory and app actions — no rigid prompt format.</p></section>

    <div className={`ai-grid ${styles.content}`}>
      <section className={`ai-card ${styles.card}`}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><span className="eyebrow">COPILOT CHAT</span><h2 className="mt-1 text-xl font-black">Create • Edit • Remember • Act</h2></div><span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-1 text-[11px] font-bold text-[var(--muted)]"><Sparkles size={13} className="mr-1 inline" /> AI 4.0</span></div>
        {custom.length > 0 && <div className="mb-3 flex items-center gap-2"><select value={selectedId} onChange={(e) => { setSelectedId(e.target.value); setResult(custom.find((x) => x.id === e.target.value) || null); }} className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/10 p-3 text-sm text-[var(--text)]"><option value="">No countdown selected</option>{custom.map((x) => <option key={x.id} value={x.id}>{x.icon} {x.name}</option>)}</select><button type="button" title="Delete selected countdown" disabled={!selectedCountdown} onClick={() => { removeCustom(selectedId); setSelectedId(""); setResult(null); }} className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-red-200 disabled:opacity-40"><Trash2 size={16} /></button></div>}
        <div className="mb-4 max-h-[390px] space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-black/10 p-3" aria-live="polite">
          {!messages.length && <div className="rounded-xl border border-white/10 bg-white/[.025] p-4 text-sm text-[var(--muted)]"><strong className="text-[var(--text)]">Try anything.</strong><br />“Meri sister ki anniversary 12 November ko hai, romantic bana de”<br />Then: “naam change karke My Big Day kar do”<br />Then: “theme thodi premium kar do”.</div>}
          {messages.map((message) => <div key={message.id} className={message.role === "user" ? "ml-auto max-w-[90%] rounded-2xl rounded-br-md bg-[var(--accent)]/15 p-3 text-sm" : "max-w-[94%] rounded-2xl rounded-bl-md border border-white/10 bg-white/[.035] p-3 text-sm"}>{message.text}</div>)}
          {busy && <div className="max-w-[94%] rounded-2xl border border-white/10 bg-white/[.035] p-3 text-sm text-[var(--muted)]"><WandSparkles size={15} className="mr-2 inline animate-pulse" /> Thinking + planning actions…</div>}
        </div>
        <label className="block text-xs font-black uppercase tracking-wider text-[var(--muted)]" htmlFor="aiPrompt">Say or type naturally</label>
        <div className="relative mt-2"><textarea id="aiPrompt" className="ai-prompt min-h-[120px] w-full rounded-2xl border border-white/10 bg-black/10 p-4 pr-14 text-[var(--text)] outline-none focus:border-[var(--accent)]" value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") generate(); }} placeholder="e.g. meri sister ki anniversary 12 november ko hai, beautiful countdown bana de" /><button type="button" onClick={startVoice} title={listening ? "Stop voice input" : "Start voice input"} className="absolute right-3 top-3 rounded-xl border border-white/10 bg-white/[.06] p-2.5 text-[var(--text)]">{listening ? <MicOff size={18} /> : <Mic size={18} />}</button></div>
        <div className="mt-3 flex flex-wrap gap-2">{examples.map((x) => <button className="rounded-full border border-white/10 bg-white/[.03] px-3 py-2 text-left text-xs text-[var(--muted)] transition hover:bg-white/[.07] hover:text-[var(--text)]" key={x} type="button" onClick={() => { setPrompt(x); generate(x); }}>{x}</button>)}</div>
        <div className="mt-4 flex flex-wrap gap-2"><button className={`create-countdown-btn ${styles.action}`} type="button" disabled={busy || !prompt.trim()} onClick={() => generate()}>{busy ? "✨ Thinking…" : "✨ Ask AI Copilot"}</button><button type="button" className="dashboard-link-btn" onClick={clearConversation}>Clear AI memory</button></div>
        <p className="ai-status" aria-live="polite">{status}</p>
      </section>

      <aside className={`ai-card ai-preview ${styles.previewCard}`}>
        <span className="eyebrow">LIVE AI WORKSPACE</span>
        <div className="mt-3 rounded-2xl border border-white/10 bg-white/[.025] p-4"><div className="text-xs uppercase tracking-wider text-[var(--muted)]">Remembered context</div><div className="mt-2 text-sm">{memory?.preferredStyle || memory?.language || memory?.tone ? `${memory.preferredStyle || "Balanced"} • ${memory.language || "Auto language"} • ${memory.tone || "Friendly"}` : "Nothing permanent yet — AI learns only what you let it remember."}</div></div>
        {preview?.imageUrl && <img className="ai-preview-image mt-4" src={preview.imageUrl} alt="" />}
        <div className="preview-icon">{preview?.icon || "✨"}</div><h2>{preview?.name || "Your AI Countdown"}</h2><p className="event-description">{preview?.description || "Create something in chat. Then keep talking — AI Creator 4.0 can refine the countdown without restarting."}</p>
        <div className="preview-box"><strong>{preview ? new Date(preview.date).toLocaleDateString(undefined, { day: "2-digit" }) : "00"}</strong><span>DAY</span><strong>{preview ? new Date(preview.date).toLocaleDateString(undefined, { month: "short" }) : "—"}</strong><span>DATE</span></div>
        {preview && <div className="mt-5 space-y-3"><div className="grid grid-cols-2 gap-2 text-left"><div className="rounded-xl border border-white/10 bg-white/[.03] p-3"><small className="block text-[10px] uppercase text-[var(--muted)]">Event date</small><strong className="text-sm">{formatDate(preview.date)}</strong></div><div className="rounded-xl border border-white/10 bg-white/[.03] p-3"><small className="block text-[10px] uppercase text-[var(--muted)]">Design</small><strong className="text-sm">{preview.theme || "default"}</strong></div></div><button className={`event-action ${styles.cardButton}`} type="button" onClick={createPreview}>🚀 Create &amp; Open Countdown</button><Link className="dashboard-link-btn block text-center" to="/design">🎨 Open Design Studio</Link></div>}
        <div className="mt-5 grid grid-cols-2 gap-2 text-xs text-[var(--muted)]"><div className="rounded-xl border border-white/10 p-3">🧠 Memory</div><div className="rounded-xl border border-white/10 p-3">🛠 Actions</div><div className="rounded-xl border border-white/10 p-3">📅 Smart dates</div><div className="rounded-xl border border-white/10 p-3">🎨 AI design</div><div className="rounded-xl border border-white/10 p-3">🌐 Multilingual</div><div className="rounded-xl border border-white/10 p-3">🎙 Voice</div></div>
      </aside>
    </div>
  </main></div>;
}
