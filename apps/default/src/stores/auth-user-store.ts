import { create } from 'zustand';

/**
 * Lightweight store holding the current authenticated user's ID.
 * This allows non-React code (other Zustand stores) to access
 * the current userId without needing a React hook.
 */
interface AuthUserStore {
  userId: string | null;
  setUserId: (id: string | null) => void;
}

export const useAuthUserStore = create<AuthUserStore>((set) => ({
  userId: null,
  setUserId: (id) => set({ userId: id }),
}));

/** Imperative getter for use outside React */
export function getCurrentUserId(): string | null {
  return useAuthUserStore.getState().userId;
}
