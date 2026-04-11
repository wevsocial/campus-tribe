import React from 'react';
import { CreditCard, Lock, AlertTriangle, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * PaywallGate: Full-screen gate shown when a paid-role user has not paid.
 * Wraps the entire dashboard content. If payment is required, shows a
 * full-screen gate with a call to action.
 *
 * Usage: wrap main content in each paid-role dashboard.
 */
interface PaywallGateProps {
  children: React.ReactNode;
  /** Override the navigate to billing callback */
  onGoToBilling?: () => void;
}

export default function PaywallGate({ children, onGoToBilling }: PaywallGateProps) {
  const { needsPayment, isSuperAdmin, profile, institution } = useAuth();

  // Super admins and students always pass through
  if (!needsPayment || isSuperAdmin) return <>{children}</>;

  const roleLabel = profile?.role?.replace(/_/g, ' ') || 'user';
  const instName = institution?.name || profile?.institution_type || 'your institution';

  return (
    <div className="relative">
      {/* Show a heavily blurred/dimmed version of the content behind */}
      <div
        className="pointer-events-none select-none"
        style={{ filter: 'blur(8px) brightness(0.4)', userSelect: 'none' }}
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Full-screen overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center mx-auto mb-5">
            <Lock size={28} className="text-amber-600" />
          </div>

          {/* Title */}
          <h2 className="font-lexend font-900 text-xl text-gray-900 dark:text-white mb-2">
            Payment Required
          </h2>

          {/* Institution */}
          <div className="flex items-center justify-center gap-1.5 mb-3">
            <Building2 size={13} className="text-primary" />
            <span className="text-sm font-jakarta font-600 text-primary">{instName}</span>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Your <strong className="text-gray-700 dark:text-gray-200 capitalize">{roleLabel}</strong> account requires a monthly subscription to access Campus Tribe features.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Please add a payment method or ask your institution administrator to cover your seat.
          </p>

          {/* Warning */}
          <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-4 py-3 mb-6 text-left">
            <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-400 font-jakarta">
              All features are locked until a valid payment is received. Students at your institution always get free access.
            </p>
          </div>

          {/* CTA */}
          <a
            href="#billing"
            onClick={(e) => {
              e.preventDefault();
              if (onGoToBilling) {
                onGoToBilling();
              } else {
                // Navigate to billing tab in current dashboard
                window.history.replaceState({}, '', window.location.pathname);
                // Trigger billing section directly
                const event = new CustomEvent('ct:open-billing');
                window.dispatchEvent(event);
              }
            }}
            className="block w-full bg-primary text-white rounded-xl py-3.5 text-sm font-jakarta font-700 hover:bg-primary/90 transition-colors mb-3"
          >
            <CreditCard size={16} className="inline mr-2" />
            Add Payment Method
          </a>

          <p className="text-xs text-gray-400 dark:text-gray-500">
            Monthly: CAD $4.99/user · Quarterly & annual plans available · 
            <a href="mailto:billing@campustribe.org" className="text-primary hover:underline ml-1">Contact billing</a>
          </p>
        </div>
      </div>
    </div>
  );
}
