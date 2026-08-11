import { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { create } from 'zustand';
import axios from 'axios';

const ACTIVATIONS_PROJECT_ID = '46ukZJmeSkHeGfXG';
const USER_ID_FIELD = '@usrId';
const EMAIL_FIELD = '@email';
const STATUS_FIELD = '@actSt';
const ACTIVE_OPTION_ID = 'status-active';

interface PremiumStore {
  isPremium: boolean;
  loading: boolean;
  checked: boolean;
  error: string | null;
  checkActivation: (userSub: string, userEmail?: string) => Promise<void>;
}

const usePremiumStore = create<PremiumStore>((set, get) => ({
  isPremium: false,
  loading: false,
  checked: false,
  error: null,

  checkActivation: async (userSub: string, userEmail?: string) => {
    if (get().checked) return;
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`/api/taskade/projects/${ACTIVATIONS_PROJECT_ID}/nodes`);
      const nodes: any[] = res.data?.payload?.nodes ?? [];

      // API returns fieldValues with paths like "/attributes/@usrId", "/attributes/@actSt"
      const getField = (node: any, fieldId: string): string | undefined => {
        const fv = node.fieldValues ?? {};
        return fv[`/attributes/${fieldId}`] ?? fv[fieldId] ?? node.attributes?.[fieldId];
      };

      const isActivated = nodes.some((node: any) => {
        const userId = getField(node, USER_ID_FIELD);
        const email = getField(node, EMAIL_FIELD);
        const status = getField(node, STATUS_FIELD);

        // Match by user sub OR email
        const subMatch = userId === userSub;
        const emailMatch = userEmail && (email === userEmail || userId === userEmail);
        if (!subMatch && !emailMatch) return false;

        // Check status is active (API returns the option ID as a string)
        return status === ACTIVE_OPTION_ID;
      });

      set({ isPremium: isActivated, loading: false, checked: true });
    } catch (err: any) {
      console.error('Failed to check premium status:', err);
      set({ loading: false, checked: true, error: err.message });
    }
  },
}));

/**
 * Hook to check if the current authenticated user has premium template access.
 *
 * How it works:
 * - Reads the "Premium Template Activations" project via API
 * - Looks for a node where the "User Auth ID (sub)" field matches the user's OIDC `sub`
 * - Checks the "Status" field is "Active"
 *
 * Admin workflow:
 * - When a user pays, add a row to the project with their `sub` and set Status = Active
 * - To revoke, change Status to Revoked
 * - Access is permanent once activated (one-time purchase)
 */
export function usePremiumStatus() {
  const auth = useAuth();
  const { isPremium, loading, checked, error, checkActivation } = usePremiumStore();

  useEffect(() => {
    const sub = auth.user?.profile?.sub;
    const email = auth.user?.profile?.email as string | undefined;
    if (sub && auth.isAuthenticated && !checked) {
      checkActivation(sub, email);
    }
  }, [auth.user?.profile?.sub, auth.user?.profile?.email, auth.isAuthenticated, checked, checkActivation]);

  return { isPremium, loading: loading || !checked, error };
}

/** Imperative check — useful outside React components */
export function getPremiumStatus(): boolean {
  return usePremiumStore.getState().isPremium;
}

/** Force re-check (e.g. after admin activates via chat) */
export function refreshPremiumStatus() {
  usePremiumStore.setState({ checked: false });
}
