import Stripe from 'npm:stripe@^22'
import { withSupabase } from 'npm:@supabase/server@^1'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '')
const appUrl = Deno.env.get('APP_URL') ?? ''
const prices: Record<string, string | undefined> = {
  pro_monthly: Deno.env.get('STRIPE_PRICE_PRO_MONTHLY'),
  pro_yearly: Deno.env.get('STRIPE_PRICE_PRO_YEARLY'),
  business: Deno.env.get('STRIPE_PRICE_BUSINESS'),
}

export default {
  fetch: withSupabase({ auth: 'user' }, async (req, ctx) => {
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

    const { plan = 'pro_monthly', provider = 'stripe' } = await req.json().catch(() => ({}))
    if (provider !== 'stripe') return Response.json({ error: 'Only Stripe is configured in this production billing adapter.' }, { status: 400 })
    if (!prices[plan]) return Response.json({ error: 'Invalid or unconfigured billing plan.' }, { status: 400 })
    if (!appUrl) return Response.json({ error: 'APP_URL is not configured.' }, { status: 500 })

    const { data: { user } } = await ctx.supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Authentication required.' }, { status: 401 })

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: prices[plan]!, quantity: 1 }],
      customer_email: user.email ?? undefined,
      client_reference_id: user.id,
      metadata: { user_id: user.id, plan },
      subscription_data: { metadata: { user_id: user.id, plan } },
      success_url: `${appUrl}/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/billing?checkout=cancelled`,
      allow_promotion_codes: true,
    })

    return Response.json({ url: session.url })
  }),
}
