import { supabase, supabaseEnabled } from './supabase';

export async function healthCheck() {
  const started = performance.now();
  if (!supabaseEnabled) return { status: 'local', latency: Math.round(performance.now() - started), message: 'Cloud is not configured; local mode is healthy.' };
  const { error } = await supabase.from('countdowns').select('id', { head: true, count: 'exact' }).limit(1);
  return { status: error ? 'degraded' : 'healthy', latency: Math.round(performance.now() - started), message: error?.message || 'Supabase is reachable.' };
}

export function getRuntimeInfo() {
  return {
    mode: supabaseEnabled ? 'cloud' : 'local',
    online: typeof navigator === 'undefined' ? true : navigator.onLine,
    secureContext: typeof window === 'undefined' ? true : window.isSecureContext,
    serviceWorker: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
  };
}
