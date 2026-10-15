# Countdown — Phase 10–12

Phase 10–12 is a major platform upgrade built on the Phase 9 React baseline while keeping the Phase 8 visual system.

## Phase 10
- Public countdown route: `/c/:slug`
- Local public links remain account-free using an encoded countdown token
- Cloud public links use stable slugs
- Native share, copy, WhatsApp, Telegram and Facebook
- QR generation + save QR
- Public/invalid countdown handling

## Phase 11
- Optional Supabase authentication
- Cloud publishing
- Local → cloud migration
- Public/private visibility
- Ownership checks through Supabase RLS
- Guest mode continues to work without Supabase

## Phase 12
- Views
- Unique visitors
- Shares
- QR scans
- Dashboard totals
- Privacy-friendly visitor ID stored locally

See `../PHASE-10-12-SETUP.md` and `../supabase/schema.sql`.

## Run

```bash
npm install
npm run dev
```

Without Supabase variables, the local app remains fully usable.
