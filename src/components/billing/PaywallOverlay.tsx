import React from 'react';
import { CreditCard, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface PaywallOverlayProps {
  children: React.ReactNode;
  /** Custom message shown on the lock overlay */
  message?: string;
  /** If true, forces the paywall even if payment is fine (for demo/testing) */
  forceBlock?: boolean;
}

/**
 * Wraps content and blurs it if the current user has a pending/overdue payment.
 * Students are never blocked. Super admins are never blocked.
 */
export default function PaywallOverlay({ children, message, forceBlock = false }: PaywallOverlayProps) {
  const { needsPayment, isSuperAdmin } = useAuth();

  const isBlocked = forceBlock || (needsPayment && !isSuperAdmin);

  if (!isBlocked) return <>{children}</>;

  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/* Blurred content */}
      <div className="select-none pointer-events-none" style={{ filter: 'blur(6px)', opacity: 0.4 }}>
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface/60 backdrop-blur-sm rounded-2xl p-6 text-center">
        <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl shadow-md flex items-center justify-center mb-3">
          <Lock size={24} className="text-primary" />
        </div>
        <p className="font-lexend font-900 text-on-surface text-base mb-1">Feature Locked</p>
        <p className="text-sm text-on-surface-variant max-w-xs mb-4">
          {message || 'Add a payment method to unlock this feature and get full access to your dashboard.'}
        </p>
        <a
          href="#billing"
          onClick={e => {
            e.preventDefault();
            window.history.replaceState({}, '', window.location.pathname + '#billing');
            window.dispatchEvent(new HashChangeEvent('hashchange'));
          }}
          className="flex items-center gap-2 bg-primary text-white rounded-full px-5 py-2.5 text-sm font-jakarta font-700 hover:bg-primary/90 transition-colors"
        >
          <CreditCard size={15} />
          Add Payment Method
        </a>
      </div>
    </div>
  );
}
