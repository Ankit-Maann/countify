# Phase 24 Production Checklist

## Before deploy
- `npm ci`
- `npm run verify`
- `npm run lint`
- `npm run build`
- Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` only if Cloud is enabled.
- Run the Phase 22–24 Supabase migration.
- Never expose a Supabase service-role key, payment secret, webhook secret, or AI provider secret in the Vite client.

## Cloud security
- Enable RLS on every user-owned table.
- Keep ownership predicates on update/delete queries.
- Add rate limits at an edge/server layer for public write endpoints.
- Validate and sanitize user input server-side as well as client-side.
- Configure auth redirect URLs for production.

## Billing
- Checkout creation and webhook verification must run server-side.
- Grant Pro access only after verified payment events.
- Store provider customer/subscription IDs server-side.

## Monitoring
- Add a hosted error monitor when a provider is selected.
- Monitor 4xx/5xx rates, database errors and Core Web Vitals.
- Keep `/status` available for basic client/runtime diagnostics.

## Recovery
- Database backups and point-in-time recovery belong to the Supabase project.
- Keep a migration history under `supabase/migrations`.

## v4.0.0 final platform checklist
- [ ] Configure `VITE_BILLING_CHECKOUT_URL` with a trusted Stripe/Razorpay checkout endpoint.
- [ ] Configure provider webhook verification server-side.
- [ ] Configure `VITE_BILLING_PORTAL_URL` if customer self-service billing is enabled.
- [ ] Apply `supabase/migrations/20261015_phase28_36.sql` after the previous migration.
- [ ] Configure production Supabase RLS and review policies before launch.
- [ ] Configure AI provider through a server/edge function; never expose API secrets in Vite.
- [ ] Configure payout/KYC/tax provider before enabling creator cash payouts.
- [ ] Test Back/Home navigation on every route.
- [ ] Test offline PWA and service-worker update from phase 27 to phase 36.
- [ ] Run `npm ci`, `npm run lint`, `npm run verify`, and `npm run build` in CI before deployment.
