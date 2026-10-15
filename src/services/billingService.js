import { supabase, supabaseEnabled } from './supabase';

const checkoutUrl = import.meta.env.VITE_BILLING_CHECKOUT_URL;
const portalUrl = import.meta.env.VITE_BILLING_PORTAL_URL;
const provider = import.meta.env.VITE_BILLING_PROVIDER || 'stripe';

export const billingConfigured = Boolean(supabaseEnabled || checkoutUrl);

export async function startCheckout({ plan = 'pro_monthly' } = {}) {
  if (supabaseEnabled) {
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { plan, provider },
    });
    if (error) throw new Error(error.message || 'Unable to start secure checkout.');
    if (!data?.url) throw new Error('Billing server did not return a checkout URL.');
    window.location.assign(data.url);
    return;
  }

  if (!checkoutUrl) {
    throw new Error('Billing is not connected. Configure Supabase and the billing Edge Functions before accepting payments.');
  }

  const response = await fetch(checkoutUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan, provider, return_url: window.location.href }),
  });
  if (!response.ok) throw new Error('Unable to start secure checkout.');
  const data = await response.json();
  if (!data?.url) throw new Error('Billing server did not return a checkout URL.');
  window.location.assign(data.url);
}

export async function getBillingEntitlement() {
  if (!supabaseEnabled) return { active: false, plan: 'free', subscription: null };
  const { data, error } = await supabase.rpc('get_my_subscription');
  if (error) return { active: false, plan: 'free', subscription: null, error };
  const subscription = Array.isArray(data) ? data[0] : data;
  return {
    active: Boolean(subscription?.active),
    plan: subscription?.plan || 'free',
    subscription: subscription || null,
  };
}

export async function openBillingPortal() {
  if (supabaseEnabled) {
    const { data, error } = await supabase.functions.invoke('billing-portal', { body: {} });
    if (error) throw new Error(error.message || 'Unable to open billing portal.');
    if (!data?.url) throw new Error('Billing server did not return a portal URL.');
    window.location.assign(data.url);
    return;
  }
  if (!portalUrl) throw new Error('Billing portal is not configured yet.');
  window.location.assign(portalUrl);
}
