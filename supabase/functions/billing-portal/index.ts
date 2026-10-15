import Stripe from 'npm:stripe@^22'
import { withSupabase } from 'npm:@supabase/server@^1'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '')
const appUrl = Deno.env.get('APP_URL') ?? ''

export default {
  fetch: withSupabase({ auth: 'user' }, async (_req, ctx) => {
    const { data: { user } } = await ctx.supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Authentication required.' }, { status: 401 })

    const { data: subscription } = await ctx.supabase
      .from('subscriptions')
      .select('provider_customer_id')
      .eq('user_id', user.id)
      .not('provider_customer_id', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!subscription?.provider_customer_id) return Response.json({ error: 'No billing customer found.' }, { status: 404 })

    const portal = await stripe.billingPortal.sessions.create({
      customer: subscription.provider_customer_id,
      return_url: appUrl ? `${appUrl}/billing` : undefined,
    })
    return Response.json({ url: portal.url })
  }),
}
