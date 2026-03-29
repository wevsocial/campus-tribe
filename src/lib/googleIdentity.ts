import { supabase } from './supabase';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '102520002176-8jav3frmhf33no84gfku8sauveckdqej.apps.googleusercontent.com';

let scriptPromise: Promise<void> | null = null;

export function loadGoogleIdentityScript() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-google-identity="true"]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Identity script')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity script'));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

/**
 * Renders a Google Sign-In button using Supabase's OAuth redirect flow.
 * This works from ANY domain without needing Google Console authorized origins.
 */
export async function initializeGoogleButton(options: {
  element: HTMLElement;
  onBeforeAuth?: () => void;
  onSuccess?: () => Promise<void> | void;
  onError?: (message: string) => void;
}) {
  // Clear the container
  options.element.innerHTML = '';

  // Try Google One Tap first (works if origin is authorized)
  // Fall back to Supabase OAuth redirect which always works
  const useSupabaseOAuth = true; // Always use Supabase OAuth for reliability

  if (useSupabaseOAuth) {
    // Render a styled button that triggers Supabase's OAuth popup
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.style.cssText = `
      display: flex; align-items: center; gap: 10px;
      padding: 10px 20px; border-radius: 9999px;
      border: 1px solid #dadce0; background: #fff;
      font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500;
      color: #3c4043; cursor: pointer; width: 320px; max-width: 100%;
      justify-content: center; transition: box-shadow 0.2s;
    `;
    btn.onmouseenter = () => { btn.style.boxShadow = '0 1px 6px rgba(0,0,0,0.15)'; };
    btn.onmouseleave = () => { btn.style.boxShadow = 'none'; };

    // Google SVG logo
    btn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 18 18">
        <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
        <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
        <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
        <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"/>
      </svg>
      Continue with Google
    `;

    btn.addEventListener('click', async () => {
      try {
        options.onBeforeAuth?.();
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/dashboard`,
            queryParams: { access_type: 'offline', prompt: 'select_account' },
          },
        });
        if (error) throw error;
        // OAuth redirect will happen — onSuccess fires after redirect in AuthContext
      } catch (error) {
        options.onError?.(error instanceof Error ? error.message : 'Google sign-in failed.');
      }
    });

    options.element.appendChild(btn);
    return;
  }

  // Original Google One Tap flow (requires authorized origin in Google Console)
  await loadGoogleIdentityScript();
  if (!window.google?.accounts?.id) throw new Error('Google Identity is unavailable.');

  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    ux_mode: 'popup',
    callback: async (response) => {
      try {
        options.onBeforeAuth?.();
        if (!response.credential) throw new Error('Google did not return a credential.');
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: response.credential,
        });
        if (error) throw error;
        await options.onSuccess?.();
      } catch (error) {
        options.onError?.(error instanceof Error ? error.message : 'Google sign-in failed.');
      }
    },
  });

  options.element.innerHTML = '';
  window.google.accounts.id.renderButton(options.element, {
    type: 'standard',
    theme: 'outline',
    text: 'continue_with',
    shape: 'pill',
    size: 'large',
    width: 320,
    logo_alignment: 'left',
  });
}
