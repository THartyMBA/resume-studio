import { useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { useUserTier, refreshUserTier } from '@/hooks/use-user-tier';
import { redirectToCheckout, getPaymentStatus, clearPaymentParams, PLANS, SIGNUP_PLANS, type PlanId } from '@/lib/stripe-checkout';
import { motion } from 'framer-motion';
import {
  Crown, Check, Loader2, Sparkles, LogOut, ShieldCheck,
  PartyPopper, Users, Zap, Star, Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PaymentGateProps {
  children: React.ReactNode;
}

export function PaymentGate({ children }: PaymentGateProps) {
  const auth = useAuth();
  const { hasAccess, loading } = useUserTier();
  const [purchasing, setPurchasing] = useState<PlanId | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const result = getPaymentStatus();
    if (result?.status === 'success') {
      clearPaymentParams();
      setShowSuccess(true);
      const poll = setInterval(() => refreshUserTier(), 3000);
      refreshUserTier();
      const timeout = setTimeout(() => clearInterval(poll), 30000);
      return () => { clearInterval(poll); clearTimeout(timeout); };
    }
    if (result?.status === 'cancelled') {
      clearPaymentParams();
      toast.error('Payment was cancelled. You can try again anytime.');
    }
  }, []);

  useEffect(() => {
    if (hasAccess && showSuccess) setShowSuccess(false);
  }, [hasAccess, showSuccess]);

  if (loading && !showSuccess) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Checking your account...</p>
        </div>
      </div>
    );
  }

  if (showSuccess && hasAccess) {
    return (
      <motion.div initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ delay: 2, duration: 0.5 }} onAnimationComplete={() => setShowSuccess(false)} className="flex items-center justify-center h-screen bg-background">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-4 text-center">
          <div className="size-20 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
            <PartyPopper className="size-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Welcome to ResumeForge!</h2>
          <p className="text-muted-foreground">Your account is activated.</p>
        </motion.div>
      </motion.div>
    );
  }

  if (showSuccess && !hasAccess) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-4 text-center max-w-md px-6">
          <div className="size-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Loader2 className="size-8 text-white animate-spin" />
          </div>
          <h2 className="text-xl font-bold">Payment received!</h2>
          <p className="text-sm text-muted-foreground">Activating your account... This usually takes just a few seconds.</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
            <ShieldCheck className="size-3.5" />
            Secured by Stripe
          </div>
        </motion.div>
      </div>
    );
  }

  if (hasAccess) return <>{children}</>;

  const handlePurchase = async (plan: PlanId) => {
    const sub = auth.user?.profile?.sub;
    const email = auth.user?.profile?.email as string;
    const name = (auth.user?.profile?.name || '') as string;
    if (!sub || !email) { toast.error('Please sign in again.'); return; }
    setPurchasing(plan);
    try {
      await redirectToCheckout({ userSub: sub, email, name, plan });
    } catch (_err) {
      toast.error('Failed to start checkout. Please try again.');
      setPurchasing(null);
    }
  };

  return <PlanSelector onSelect={handlePurchase} purchasing={purchasing} onSignOut={() => auth.signoutRedirect()} />;
}

const tierIcons: Record<PlanId, React.ElementType> = {
  lifetime: Star,
  monthly: Zap,
  agency: Building2,
  premium_templates: Crown,
  ai_credits: Sparkles,
};

const tierColors: Record<PlanId, string> = {
  lifetime: 'from-violet-500 to-purple-600',
  monthly: 'from-blue-500 to-cyan-500',
  agency: 'from-amber-500 to-orange-500',
  premium_templates: 'from-rose-500 to-pink-500',
  ai_credits: 'from-emerald-500 to-teal-500',
};

function PlanSelector({ onSelect, purchasing, onSignOut }: {
  onSelect: (plan: PlanId) => void; purchasing: PlanId | null; onSignOut: () => void;
}) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-4 py-12 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-blue-600/5 dark:from-violet-600/10 dark:to-blue-600/10" />
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-violet-500/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Choose Your Plan</h1>
        <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
          Every plan includes the full AI resume toolkit. Pick what fits your career journey.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl w-full">
        {SIGNUP_PLANS.map((planId, i) => {
          const plan = PLANS[planId];
          const Icon = tierIcons[planId];
          const isPurchasing = purchasing === planId;
          const isHighlighted = plan.highlight;
          const disabledState = purchasing !== null;

          return (
            <motion.div
              key={planId}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className={cn(
                'relative flex flex-col rounded-2xl border bg-card/80 backdrop-blur-sm p-6 transition-all hover:shadow-xl',
                isHighlighted ? 'border-primary/40 shadow-lg shadow-primary/10 ring-1 ring-primary/20' : 'border-border/50 hover:border-primary/20'
              )}
            >
              {plan.badge && (
                <div className={cn(
                  'absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold text-white bg-gradient-to-r',
                  tierColors[planId]
                )}>
                  {plan.badge}
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={cn('size-10 rounded-xl bg-gradient-to-br flex items-center justify-center', tierColors[planId])}>
                  <Icon className="size-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">{plan.name}</h3>
                  <p className="text-[10px] text-muted-foreground">{plan.tagline}</p>
                </div>
              </div>

              <div className="flex items-baseline gap-0.5 mb-4">
                <span className="text-3xl font-bold">{plan.priceLabel}</span>
                {plan.priceSub && <span className="text-xs text-muted-foreground">{plan.priceSub}</span>}
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs">
                    <Check className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => onSelect(planId)}
                disabled={disabledState}
                className={cn(
                  'w-full gap-2',
                  isHighlighted
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-md'
                    : ''
                )}
              >
                {isPurchasing ? (
                  <><Loader2 className="size-4 animate-spin" /> Redirecting...</>
                ) : (
                  <>Get {plan.name}</>
                )}
              </Button>
            </motion.div>
          );
        })}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-8 flex items-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-1"><ShieldCheck className="size-3" /> Secured by Stripe</div>
        <div className="flex items-center gap-1"><Users className="size-3" /> 500+ professionals</div>
        <button onClick={onSignOut} className="flex items-center gap-1 hover:text-foreground transition-colors">
          <LogOut className="size-3" /> Sign out
        </button>
      </motion.div>
    </div>
  );
}
