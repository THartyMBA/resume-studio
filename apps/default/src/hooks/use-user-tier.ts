import { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { create } from 'zustand';
import axios from 'axios';

const ACCOUNTS_PROJECT_ID = '46ukZJmeSkHeGfXG';

// ── Types ───────────────────────────────────────────────────────────
export type UserTier = 'admin' | 'lifetime' | 'monthly' | 'agency' | null;

export interface UserAccount {
  tier: UserTier;
  status: 'active' | 'revoked';
  hasPremiumTemplates: boolean;
  aiCreditsRemaining: number; // -1 = unlimited
  bonusCredits: number;
  maxClients: number; // 0 = n/a, >0 = agency limit
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

const DEFAULT_ACCOUNT: UserAccount = {
  tier: null,
  status: 'revoked',
  hasPremiumTemplates: false,
  aiCreditsRemaining: 0,
  bonusCredits: 0,
  maxClients: 0,
};

// ── Helpers ─────────────────────────────────────────────────────────
const getField = (node: any, fieldId: string): string | undefined => {
  const fv = node.fieldValues ?? {};
  return fv[`/attributes/${fieldId}`] ?? fv[fieldId] ?? node.attributes?.[fieldId];
};

const getNumField = (node: any, fieldId: string): number => {
  const v = getField(node, fieldId);
  if (v === undefined || v === null || v === '') return 0;
  const n = Number(v);
  return isNaN(n) ? 0 : n;
};

const tierFromOption = (optionId: string | undefined): UserTier => {
  switch (optionId) {
    case 'tier-admin': return 'admin';
    case 'tier-lifetime': return 'lifetime';
    case 'tier-monthly': return 'monthly';
    case 'tier-agency': return 'agency';
    default: return null;
  }
};

// ── Store ───────────────────────────────────────────────────────────
interface UserTierStore {
  account: UserAccount;
  loading: boolean;
  checked: boolean;
  error: string | null;
  checkAccount: (userSub: string, userEmail?: string) => Promise<void>;
}

const useUserTierStore = create<UserTierStore>((set, get) => ({
  account: DEFAULT_ACCOUNT,
  loading: false,
  checked: false,
  error: null,

  checkAccount: async (userSub: string, userEmail?: string) => {
    if (get().checked) return;
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`/api/taskade/projects/${ACCOUNTS_PROJECT_ID}/nodes`);
      const nodes: any[] = res.data?.payload?.nodes ?? [];

      // Find all entries matching this user (by sub, email, or Stripe customer ID)
      const matches = nodes.filter((node: any) => {
        const userId = getField(node, '@usrId');
        const email = getField(node, '@email');
        const stripeCu = getField(node, '@strCu');
        return userId === userSub
          || (userEmail && (email === userEmail || userId === userEmail))
          || (userEmail && stripeCu === userEmail);
      });

      if (matches.length === 0) {
        set({ account: DEFAULT_ACCOUNT, loading: false, checked: true });
        return;
      }

      // Use the LAST matching entry (most recent) as the canonical state
      // But merge: admin trumps everything, any active entry counts
      let bestAccount = { ...DEFAULT_ACCOUNT };
      let hasActiveEntry = false;

      for (const node of matches) {
        const status = getField(node, '@actSt');
        const tier = tierFromOption(getField(node, '@tier'));
        const isActive = status === 'status-active';
        const premTemplates = getField(node, '@hasPT');

        if (isActive) {
          hasActiveEntry = true;

          // Admin always wins
          if (tier === 'admin') {
            bestAccount = {
              tier: 'admin',
              status: 'active',
              hasPremiumTemplates: true,
              aiCreditsRemaining: -1,
              bonusCredits: 0,
              maxClients: 999,
              stripeCustomerId: getField(node, '@strCu'),
              stripeSubscriptionId: getField(node, '@strSu'),
            };
            break;
          }

          // Higher tiers override lower ones: agency > monthly > lifetime
          const tierRank: Record<string, number> = { agency: 3, monthly: 2, lifetime: 1 };
          const currentRank = tierRank[bestAccount.tier || ''] ?? 0;
          const newRank = tierRank[tier || ''] ?? 0;

          if (newRank >= currentRank && tier) {
            bestAccount.tier = tier;
            bestAccount.status = 'active';
            bestAccount.stripeCustomerId = getField(node, '@strCu') || bestAccount.stripeCustomerId;
            bestAccount.stripeSubscriptionId = getField(node, '@strSu') || bestAccount.stripeSubscriptionId;

            if (tier === 'agency') {
              bestAccount.aiCreditsRemaining = -1;
              bestAccount.hasPremiumTemplates = true;
              bestAccount.maxClients = getNumField(node, '@clMax') || 25;
            } else if (tier === 'monthly') {
              bestAccount.aiCreditsRemaining = -1;
            } else if (tier === 'lifetime') {
              const credits = getNumField(node, '@aiCr');
              bestAccount.aiCreditsRemaining = credits || 100;
            }
          }

          // Premium templates is additive
          if (premTemplates === 'pt-yes') {
            bestAccount.hasPremiumTemplates = true;
          }

          // Bonus credits stack
          bestAccount.bonusCredits += getNumField(node, '@aiBon');
        }
      }

      // If the most recent entry is a revocation and no active entries exist
      if (!hasActiveEntry) {
        bestAccount = { ...DEFAULT_ACCOUNT, status: 'revoked' };
      }

      set({ account: bestAccount, loading: false, checked: true });
    } catch (err: any) {
      console.error('Failed to check user tier:', err);
      set({ loading: false, checked: true, error: err.message });
    }
  },
}));

// ── Hook ────────────────────────────────────────────────────────────
export function useUserTier() {
  const auth = useAuth();
  const { account, loading, checked, error, checkAccount } = useUserTierStore();

  useEffect(() => {
    const sub = auth.user?.profile?.sub;
    const email = auth.user?.profile?.email as string | undefined;
    if (sub && auth.isAuthenticated && !checked) {
      checkAccount(sub, email);
    }
  }, [auth.user?.profile?.sub, auth.user?.profile?.email, auth.isAuthenticated, checked, checkAccount]);

  const hasAccess = account.status === 'active' && account.tier !== null;
  const hasUnlimitedAI = account.aiCreditsRemaining === -1;
  const totalCredits = hasUnlimitedAI ? Infinity : account.aiCreditsRemaining + account.bonusCredits;

  return {
    account,
    tier: account.tier,
    hasAccess,
    hasPremiumTemplates: account.hasPremiumTemplates,
    hasUnlimitedAI,
    totalCredits,
    isAdmin: account.tier === 'admin',
    isAgency: account.tier === 'agency',
    loading: loading || !checked,
    error,
  };
}

// ── Imperative helpers ──────────────────────────────────────────────
export function getUserTier(): UserAccount {
  return useUserTierStore.getState().account;
}

export function refreshUserTier() {
  useUserTierStore.setState({ checked: false });
}
