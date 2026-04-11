import React, { useCallback, useEffect, useState } from 'react';
import { Eye, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StealthContext {
  institutionId: string;
  institutionName: string;
  role: string;
  startedAt: string;
}

export function useStealthMode(): { stealth: StealthContext | null; exitStealth: () => void } {
  const [stealth, setStealth] = useState<StealthContext | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('ct_stealth_mode');
      setStealth(raw ? JSON.parse(raw) : null);
    } catch {
      setStealth(null);
    }
  }, []);

  const exitStealth = useCallback(() => {
    sessionStorage.removeItem('ct_stealth_mode');
    setStealth(null);
    navigate('/admin');
  }, [navigate]);

  return { stealth, exitStealth };
}

export default function StealthBanner() {
  const { stealth, exitStealth } = useStealthMode();

  if (!stealth) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-3 bg-red-600 text-white px-4 py-2.5 shadow-lg">
      <div className="flex items-center gap-2 min-w-0">
        <Eye size={15} className="shrink-0" />
        <span className="text-xs font-jakarta font-700 truncate">
          STEALTH: {stealth.institutionName} · as {stealth.role}
        </span>
      </div>
      <button
        onClick={exitStealth}
        className="flex items-center gap-1.5 text-xs font-jakarta font-700 bg-white/20 hover:bg-white/30 rounded-full px-3 py-1 shrink-0 transition-colors"
      >
        <ArrowLeft size={11} />
        Exit
      </button>
    </div>
  );
}
