import axios from 'axios';

const PAYMENT_WEBHOOK_URL = '/api/taskade/webhooks/01KXGQYM7ZCTPR9EP9AANTP57G/run';
const SUBSCRIPTION_WEBHOOK_URL = '/api/taskade/webhooks/01KXGQYTXPNXTRM0W8KDHEHR8D/run';

export type PlanId = 'lifetime' | 'monthly' | 'agency' | 'premium_templates' | 'ai_credits';

export interface PlanDef {
  id: PlanId;
  name: string;
  tagline: string;
  priceLabel: string;
  priceSub?: string;
  priceId: string;
  mode: 'payment' | 'subscription';
  features: string[];
  badge?: string;
  highlight?: boolean;
}

export const PLANS: Record<PlanId, PlanDef> = {
  lifetime: {
    id: 'lifetime',
    name: 'Lifetime',
    tagline: 'Pay once, use forever',
    priceLabel: '$49',
    priceSub: 'one-time',
    priceId: 'price_1Te1ciLz84T2EXVkPArUZ8Zo',
    mode: 'payment',
    badge: 'Best Value',
    highlight: true,
    features: [
      'All standard features forever',
      '100 AI credits/month (auto-reset)',
      'Buy extra credit packs anytime',
      'Free templates included',
    ],
  },
  monthly: {
    id: 'monthly',
    name: 'Monthly Pro',
    tagline: 'Unlimited AI, cancel anytime',
    priceLabel: '$19',
    priceSub: '/month',
    priceId: 'price_1Te1cnLz84T2EXVkfbd6EfQy',
    mode: 'subscription',
    features: [
      'All standard features',
      'Unlimited AI credits',
      'Free templates included',
      'Cancel anytime',
    ],
  },
  agency: {
    id: 'agency',
    name: 'Agency',
    tagline: 'For resume writers & career coaches',
    priceLabel: '$99',
    priceSub: '/month',
    priceId: 'price_1Te1csLz84T2EXVk4JZXuhxq',
    mode: 'subscription',
    badge: 'Multi-Client',
    features: [
      'Unlimited AI credits',
      'All premium templates included',
      'Multi-client workspace (25 clients)',
      'White-label ready',
      'Priority support',
    ],
  },
  premium_templates: {
    id: 'premium_templates',
    name: 'Premium Templates',
    tagline: 'Unlock all 20+ designs',
    priceLabel: '$29',
    priceSub: 'one-time add-on',
    priceId: 'price_1Te1S9Lz84T2EXVk7l2J0xpm',
    mode: 'payment',
    features: [
      'All 20+ premium templates',
      'New templates added regularly',
      'One-time, yours forever',
    ],
  },
  ai_credits: {
    id: 'ai_credits',
    name: '50 AI Credits',
    tagline: 'Top up your credits',
    priceLabel: '$9',
    priceSub: 'one-time',
    priceId: 'price_1Te1cxLz84T2EXVknIucwG9e',
    mode: 'payment',
    features: [
      '50 additional AI credits',
      'Never expire',
      'Stack with monthly allowance',
    ],
  },
};

export const SIGNUP_PLANS: PlanId[] = ['lifetime', 'monthly', 'agency'];

interface CheckoutParams {
  userSub: string;
  email: string;
  name?: string;
  plan: PlanId;
}

export async function redirectToCheckout({ userSub, email, name, plan }: CheckoutParams): Promise<void> {
  const def = PLANS[plan];
  if (!def) throw new Error('Unknown plan: ' + plan);

  const webhookUrl = def.mode === 'subscription' ? SUBSCRIPTION_WEBHOOK_URL : PAYMENT_WEBHOOK_URL;

  const res = await axios.post(webhookUrl, {
    user_sub: userSub,
    email,
    name: name || '',
    plan,
    price_id: def.priceId,
  });

  const data = res.data?.body ?? res.data ?? {};
  const url = data.checkout_url;

  if (!url) throw new Error('Failed to create checkout session');
  window.location.href = url;
}

export function getPaymentStatus(): { status: 'success' | 'cancelled'; plan?: string } | null {
  const params = new URLSearchParams(window.location.search);
  const payment = params.get('payment');
  const plan = params.get('plan') || undefined;
  if (payment === 'success') return { status: 'success', plan };
  if (payment === 'cancelled') return { status: 'cancelled' };
  return null;
}

export function clearPaymentParams(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete('payment');
  url.searchParams.delete('plan');
  window.history.replaceState({}, '', url.toString());
}
