import Stripe from 'npm:stripe@^22'
import { createClient } from 'npm:@supabase/supabase-js@^2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '')
const cryptoProvider = Stripe.createSubtleCryptoProvider()
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
)
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET') ?? ''

async function syncSubscription(subscription: Stripe.Subscription, fallbackUserId?: string, fallbackPlan?: string) {
  const userId = String(subscription.metadata?.user_id || fallbackUserId || '')
  if (!userId) throw new Error('Subscription has no user_id metadata')

  const plan = String(subscription.metadata?.plan || fallbackPlan || 'pro_monthly')
  const statusMap: Record<string, string> = {
    active: 'active',
    trialing: 'trialing',
    past_due: 'past_due',
    canceled: 'canceled',
    incomplete: 'pending',
    incomplete_expired: 'expired',
    unpaid: 'expired',
    paused: 'expired',
  }
  const status = statusMap[subscription.status] ?? 'pending'
  const currentPeriodEnd = subscription.items.data[0]?.current_period_end
    ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString()
    : null

  const { error } = await supabase.from('subscriptions').upsert({
    user_id: userId,
    provider: 'stripe',
    provider_customer_id: String(subscription.customer),
    provider_subscription_id: subscription.id,
    plan,
    status,
    current_period_end: currentPeriodEnd,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'provider_subscription_id' })
  if (error) throw error
}

export default {
  fetch: async (req: Request) => {
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
    const signature = req.headers.get('stripe-signature') ?? ''
    const body = await req.text()

    let event: Stripe.Event
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret, undefined, cryptoProvider)
    } catch (error) {
      console.error('Stripe signature verification failed:', error)
      return new Response('Invalid signature', { status: 400 })
    }

    try {
      if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
        const session = event.data.object as Stripe.Checkout.Session
        const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          await syncSubscription(subscription, session.metadata?.user_id || session.client_reference_id || undefined, session.metadata?.plan)
        }
      }

      if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
        await syncSubscription(event.data.object as Stripe.Subscription)
      }

      return Response.json({ received: true })
    } catch (error) {
      console.error('Stripe event processing failed:', error)
      return new Response('Webhook processing failed', { status: 500 })
    }
  },
}
