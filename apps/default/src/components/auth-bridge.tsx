import { useEffect, useRef } from 'react';
import { useAuth } from 'react-oidc-context';
import { useAuthUserStore } from '@/stores/auth-user-store';
import { useResumeStore } from '@/stores/resume-store';
import { useJobTrackerStore } from '@/stores/job-tracker-store';

/**
 * Bridges the OIDC auth context into the Zustand auth-user store.
 * Also handles hydrating per-user data when userId changes and
 * clearing data on sign-out.
 */
export function AuthBridge({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const setUserId = useAuthUserStore((s) => s.setUserId);
  const currentUserId = useAuthUserStore((s) => s.userId);
  const prevUserIdRef = useRef<string | null>(null);

  const sub = auth.user?.profile?.sub ?? null;

  useEffect(() => {
    // Only update if sub actually changed
    if (sub === prevUserIdRef.current) return;
    prevUserIdRef.current = sub;

    setUserId(sub);

    if (sub) {
      // User signed in — hydrate their data
      useResumeStore.getState().hydrateForUser(sub);
      // Job tracker will be fetched on mount via its own useEffect
    } else {
      // User signed out — clear all stores
      useResumeStore.getState().clearForSignOut();
      useJobTrackerStore.setState({ jobs: [], loading: false, error: null });
    }
  }, [sub, setUserId]);

  return <>{children}</>;
}
