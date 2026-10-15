# Countdown Platform — Phases 22–24

## Phase 22 — Creator & Community
- Community hub at `/community`
- Creator profiles at `/creator/:username`
- Local likes, bookmarks and follows work without Supabase
- Saved library at `/saved`
- Optional Supabase schema in `supabase/migrations/20261015_phase22_24.sql`
- New UI uses Tailwind utilities + CSS Modules and matches the existing glass/gradient visual language.

## Phase 23 — Pro / Business foundation
- Existing `/premium` remains guest-safe and provider-neutral.
- Premium boundaries are client-ready without embedding payment secrets.
- Future billing provider can be connected through the existing cloud layer.

## Phase 24 — Production readiness
- Runtime status page at `/status`
- Local/cloud health check
- Offline/secure-context/service-worker indicators
- Error boundary retained
- Input normalization and URL validation retained
- Supabase RLS schema and indexes included

### Cloud setup
1. Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
2. Run the SQL migration in Supabase.
3. Keep service-role keys server-side only; never place them in Vite env variables.
4. Billing credentials and webhooks belong on a trusted server/edge function.
