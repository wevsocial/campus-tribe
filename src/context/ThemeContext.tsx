import React, { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react';

interface ThemeContextType {
  dark: boolean;
  toggle: () => void;
  setDark: (value: boolean) => void;
}

export const ThemeContext = createContext<ThemeContextType>({ dark: false, toggle: () => {}, setDark: () => {} });

function resolveInitialTheme(): boolean {
  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
}

// Apply dark class synchronously before first paint to avoid flash
function applyTheme(dark: boolean) {
  const root = document.documentElement;
  if (dark) {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }
  try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch {}
}

// Apply immediately on module load (before React renders)
applyTheme(resolveInitialTheme());

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDarkState] = useState(resolveInitialTheme);

  // useLayoutEffect runs synchronously after DOM mutations, before paint
  useLayoutEffect(() => {
    applyTheme(dark);
  }, [dark]);

  // Listen to OS preference changes (only if user hasn't manually set preference)
  useEffect(() => {
    try {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (event: MediaQueryListEvent) => {
        const stored = localStorage.getItem('theme');
        if (!stored) {
          setDarkState(event.matches);
        }
      };
      media.addEventListener('change', handler);
      return () => media.removeEventListener('change', handler);
    } catch {
      return undefined;
    }
  }, []);

  const setDark = (value: boolean) => {
    setDarkState(value);
    applyTheme(value);
  };

  const toggle = () => {
    const next = !dark;
    setDarkState(next);
    applyTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ dark, toggle, setDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
