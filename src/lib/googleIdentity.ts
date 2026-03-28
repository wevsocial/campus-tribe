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

export async function initializeGoogleButton(options: {
  element: HTMLElement;
  onBeforeAuth?: () => void;
  onSuccess?: () => Promise<void> | void;
  onError?: (message: string) => void;
}) {
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
