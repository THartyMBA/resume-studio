import './index.css';
import './lib/leaflet-setup';

import { createRoot } from 'react-dom/client';
import { SimpleThemeProvider } from './lib/theme-provider';

import App from './App.jsx';
import { GenesisRoot } from './lib/genesis.jsx';
import { GenesisAuth } from './lib/genesis-auth';
import { AuthBridge } from './components/auth-bridge';
import { setupThemeBridge } from './lib/theme-bridge';
import { Toaster } from 'sonner';

setupThemeBridge();

// Pre-boot: strip OIDC error params before React mounts.
// When the OIDC provider returns an error (e.g. expired interaction),
// the URL contains ?error=... params. If AuthProvider sees these, it throws
// a non-Error object that bypasses React's error boundaries and causes #310.
// We ONLY strip error params — valid ?code=&state= pairs are left intact
// so AuthProvider can complete the sign-in flow.
(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.has('error')) {
    for (const p of ['code', 'state', 'session_state', 'iss', 'error', 'error_description']) {
      params.delete(p);
    }
    const remaining = params.toString();
    window.history.replaceState(
      {},
      '',
      window.location.pathname + (remaining ? `?${remaining}` : ''),
    );
    // Clear OIDC session storage to prevent stale state
    try {
      const keys = Object.keys(sessionStorage);
      for (const key of keys) {
        if (key.startsWith('oidc.')) sessionStorage.removeItem(key);
      }
    } catch { /* ignore */ }
  }
})();

// Note: StrictMode is intentionally omitted.
// React 18 StrictMode double-mounts components, which causes the OIDC
// AuthProvider to consume the authorization code twice on callback redirect,
// resulting in "Interaction not found or expired" errors.
createRoot(document.getElementById('root')!).render(
  <GenesisRoot>
    <SimpleThemeProvider defaultTheme="dark">
      <GenesisAuth>
        <AuthBridge>
          <App />
          <Toaster position="bottom-right" theme="system" richColors />
        </AuthBridge>
      </GenesisAuth>
    </SimpleThemeProvider>
  </GenesisRoot>,
);
