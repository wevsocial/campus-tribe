import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  dark: boolean;
  toggle: () => void;
  setDark: (value: boolean) => void;
}

export const ThemeContext = createContext<ThemeContextType>({ dark: false, toggle: () => {}, setDark: () => {} });

function resolveInitialTheme() {
  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
}

// Apply theme class immediately to avoid FOUC
const initialDark = resolveInitialTheme();
if (initialDark) {
  document.documentElement.classList.add('dark');
  document.documentElement.style.colorScheme = 'dark';
} else {
  document.documentElement.classList.remove('dark');
  document.documentElement.style.colorScheme = 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(initialDark);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', dark);
    root.style.colorScheme = dark ? 'dark' : 'light';
    document.body.classList.toggle('dark', dark);
    try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch {}
  }, [dark]);

  useEffect(() => {
    try {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (event: MediaQueryListEvent) => {
        const stored = localStorage.getItem('theme');
        if (!stored) setDark(event.matches);
      };
      media.addEventListener('change', handler);
      return () => media.removeEventListener('change', handler);
    } catch {
      return undefined;
    }
  }, []);

  const toggle = () => setDark((value) => !value);
  return <ThemeContext.Provider value={{ dark, toggle, setDark }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
