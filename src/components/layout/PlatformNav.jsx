import { ArrowLeft, Home, Sparkles } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { APP_VERSION } from '../../config/appVersion';

const links = [
  ['/', 'Countdown'], ['/create', 'Creator'], ['/ai', 'AI'], ['/design', 'Design'],
  ['/explore', 'Explore'], ['/community', 'Community'], ['/saved', 'Saved'], ['/dashboard', 'Dashboard'],
  ['/premium', 'Pro'], ['/platform', 'All Features'], ['/billing', 'Billing'], ['/status', 'Status'], ['/release', `v${APP_VERSION}`],
];

export default function PlatformNav({ compact = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  return (
    <div className="w-full">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex flex-wrap gap-2">
          {!isHome && <button type="button" onClick={() => navigate(-1)} className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2 text-xs font-semibold transition hover:-translate-y-0.5"><ArrowLeft size={14} className="mr-1 inline" /> Back</button>}
          {!isHome && <Link to="/" className="rounded-full border border-white/10 bg-white/[.04] px-3 py-2 text-xs font-semibold transition hover:-translate-y-0.5"><Home size={14} className="mr-1 inline" /> Home</Link>}
        </div>
        {!compact && <span className="hidden text-[10px] font-bold uppercase tracking-[.18em] text-[var(--muted)] sm:inline"><Sparkles size={12} className="mr-1 inline" /> Countify {APP_VERSION}</span>}
      </div>
      <nav className="flex w-full flex-wrap justify-center gap-2 px-1 py-2" aria-label="Platform navigation">
        {links.map(([to, label]) => (
          <Link key={to} to={to} className={`rounded-full border px-3 py-2 text-xs font-semibold transition hover:-translate-y-0.5 ${location.pathname === to ? 'border-[var(--accent)] bg-white/10' : 'border-white/10 bg-white/[.04]'}`}>
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
