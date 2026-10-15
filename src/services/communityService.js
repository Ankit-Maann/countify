import { supabase, supabaseEnabled } from './supabase';

const KEYS = {
  profile: 'countdown-profile',
  follows: 'countdown-follows',
  bookmarks: 'countdown-bookmarks',
  likes: 'countdown-likes',
  reports: 'countdown-reports',
};

function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; }
}
function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage is optional */ }
}
function slugify(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 32) || 'creator';
}

export function getProfile() {
  return read(KEYS.profile, { username: 'countdown-creator', displayName: 'Countdown Creator', bio: 'Making moments easier to remember.', avatar: '✨' });
}
export function saveProfile(input) {
  const next = {
    username: slugify(input.username),
    displayName: String(input.displayName || '').trim().slice(0, 60) || 'Countdown Creator',
    bio: String(input.bio || '').trim().slice(0, 180),
    avatar: String(input.avatar || '✨').slice(0, 8),
  };
  write(KEYS.profile, next);
  return next;
}

export function isFollowing(username) { return read(KEYS.follows, []).includes(slugify(username)); }
export function toggleFollow(username) {
  const id = slugify(username); const list = read(KEYS.follows, []);
  const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  write(KEYS.follows, next); return next.includes(id);
}
export function getFollowing() { return read(KEYS.follows, []); }

export function isBookmarked(id) { return read(KEYS.bookmarks, []).includes(String(id)); }
export function toggleBookmark(id) {
  const key = String(id); const list = read(KEYS.bookmarks, []);
  const next = list.includes(key) ? list.filter((x) => x !== key) : [...list, key];
  write(KEYS.bookmarks, next); return next.includes(key);
}
export function getBookmarks() { return read(KEYS.bookmarks, []); }

export function isLiked(id) { return read(KEYS.likes, []).includes(String(id)); }
export function toggleLike(id) {
  const key = String(id); const list = read(KEYS.likes, []);
  const next = list.includes(key) ? list.filter((x) => x !== key) : [...list, key];
  write(KEYS.likes, next); return next.includes(key);
}
export function getLikes() { return read(KEYS.likes, []); }

export function reportCountdown(item, reason = 'other') {
  const reports = read(KEYS.reports, []);
  const entry = { id: String(item.id || item.slug || item.name), reason: String(reason).slice(0, 40), createdAt: new Date().toISOString() };
  write(KEYS.reports, [...reports.filter((x) => x.id !== entry.id), entry]);
  return entry;
}

export async function getCreatorProfile(username) {
  const slug = slugify(username);
  if (supabaseEnabled) {
    const { data, error } = await supabase.from('creator_profiles').select('*').eq('username', slug).maybeSingle();
    if (!error && data) return data;
  }
  const local = getProfile();
  return local.username === slug ? local : { username: slug, displayName: slug.replace(/-/g, ' '), bio: 'Countdown creator', avatar: '✨' };
}

export async function saveRemoteProfile(profile) {
  if (!supabaseEnabled) return profile;
  const { data, error } = await supabase.from('creator_profiles').upsert(profile, { onConflict: 'username' }).select().single();
  if (error) throw error; return data;
}
