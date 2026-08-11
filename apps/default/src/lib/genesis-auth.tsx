import { useCallback, useState, type ReactNode } from 'react';
import { AuthProvider, useAuth } from 'react-oidc-context';
import type { User } from 'oidc-client-ts';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Remove all OIDC keys from sessionStorage to clear stale state. */
function clearOidcStorage() {
  try {
    const keys = Object.keys(sessionStorage);
    for (const key of keys) {
      if (key.startsWith('oidc.')) sessionStorage.removeItem(key);
    }
  } catch {
    /* storage unavailable */
  }
}

/** Strip OIDC callback query params so a refresh won't re-trigger the flow. */
function cleanUrl() {
  const url = new URL(window.location.href);
  let changed = false;
  for (const p of ['code', 'state', 'session_state', 'iss', 'error', 'error_description']) {
    if (url.searchParams.has(p)) {
      url.searchParams.delete(p);
      changed = true;
    }
  }
  if (changed) {
    window.history.replaceState({}, '', url.pathname + (url.search || ''));
  }
}

/* ------------------------------------------------------------------ */
/*  AuthErrorGate                                                      */
/*  Sits INSIDE AuthProvider so it can read `useAuth().error`.         */
/*  Uses only inline styles — zero dependency on Tailwind / theme —   */
/*  so it can never crash itself.                                      */
/* ------------------------------------------------------------------ */

function AuthErrorGate({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const [recovering, setRecovering] = useState(false);

  const handleRetry = useCallback(async () => {
    setRecovering(true);
    try {
      await auth.removeUser();
    } catch {
      /* ignore */
    }
    clearOidcStorage();
    cleanUrl();
    window.location.replace('/');
  }, [auth]);

  if (auth.error && !recovering) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '2rem',
          background: '#09090b',
          color: '#fafafa',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(239,68,68,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: 24,
            }}
          >
            ⚠️
          </div>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 700 }}>
            Sign-in issue
          </h2>
          <p
            style={{
              color: '#a1a1aa',
              margin: '0 0 1.5rem',
              fontSize: '0.875rem',
              lineHeight: 1.6,
            }}
          >
            The sign-in session expired or encountered an error. Click below to start fresh.
          </p>
          <button
            type="button"
            onClick={handleRetry}
            style={{
              padding: '0.625rem 1.5rem',
              background: '#7c3aed',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/* ------------------------------------------------------------------ */
/*  GenesisAuth                                                        */
/* ------------------------------------------------------------------ */

/**
 * Genesis OIDC auth wrapper.
 *
 * - Auto-discovers config from `/_genesis/auth/.well-known/openid-configuration`
 * - Cleans callback params from URL after redirect
 * - Catches auth errors (expired interaction, invalid code, etc.) and
 *   shows a recovery screen instead of crashing the app
 */
export function GenesisAuth({ children }: { children: ReactNode }) {
  const origin = window.location.origin;

  const handleSigninCallback = useCallback((_user: User | void) => {
    cleanUrl();
  }, []);

  return (
    <AuthProvider
      authority={`${origin}/_genesis/auth`}
      client_id="default"
      redirect_uri={`${origin}/`}
      scope="openid profile email"
      automaticSilentRenew={true}
      onSigninCallback={handleSigninCallback}
    >
      <AuthErrorGate>{children}</AuthErrorGate>
    </AuthProvider>
  );
}
