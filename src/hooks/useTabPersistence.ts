import { useState, useEffect } from 'react';

export function useTabPersistence(key: string, defaultTab: string): [string, (tab: string) => void] {
  const storageKey = `ct_tab_${key}`;
  const [activeTab, setActiveTab] = useState(() => {
    try { return localStorage.getItem(storageKey) || defaultTab; }
    catch { return defaultTab; }
  });
  const setTab = (tab: string) => {
    setActiveTab(tab);
    try { localStorage.setItem(storageKey, tab); } catch {}
  };
  return [activeTab, setTab];
}
