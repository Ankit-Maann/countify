# Phase 31 — Production Billing

Countify uses Stripe Checkout + Supabase Edge Functions. The browser never receives Stripe secret keys and Pro access is granted only from a verified subscription row.

## Edge Functions

- `create-checkout` — authenticated user -> Stripe Checkout Session
- `stripe-webhook` — public signed Stripe webhook -> verified subscription sync
- `billing-portal` — authenticated user -> Stripe Customer Portal

Supabase config disables JWT verification only for the Stripe webhook because Stripe does not send Supabase user JWTs. The webhook verifies the raw request body with `Stripe-Signature` before processing it.

## Required Supabase secrets

```text
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SIGNING_SECRET
STRIPE_PRICE_PRO_MONTHLY
STRIPE_PRICE_PRO_YEARLY
STRIPE_PRICE_BUSINESS
APP_URL
```

Set them with the Supabase CLI, for example:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_WEBHOOK_SIGNING_SECRET=whsec_...
supabase secrets set STRIPE_PRICE_PRO_MONTHLY=price_...
supabase secrets set STRIPE_PRICE_PRO_YEARLY=price_...
supabase secrets set STRIPE_PRICE_BUSINESS=price_...
supabase secrets set APP_URL=https://your-domain.example
```

## Deploy

```bash
supabase functions deploy create-checkout --use-api
supabase functions deploy stripe-webhook --use-api
supabase functions deploy billing-portal --use-api
```

## Stripe webhook

Create a webhook endpoint pointing to:

```text
https://<PROJECT_REF>.supabase.co/functions/v1/stripe-webhook
```

Subscribe to:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Copy the Stripe signing secret into `STRIPE_WEBHOOK_SIGNING_SECRET`.

## Database

Apply `supabase/migrations/20261015_phase28_36.sql`. The `get_my_subscription()` security-definer function exposes only the current authenticated user's entitlement.

## Frontend

Set only public Supabase variables in the Vite environment:

```text
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Do **not** put `STRIPE_SECRET_KEY`, webhook secrets, or service-role keys in `.env` used by Vite.
