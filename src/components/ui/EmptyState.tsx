import React from 'react';

interface EmptyStateProps {
  icon?: string;
  message: string;
  cta?: string;
  onCta?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon = '📭', message, cta, onCta }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center bg-surface-lowest rounded-xl">
      <span className="text-5xl mb-4">{icon}</span>
      <p className="font-jakarta text-on-surface-variant text-base mb-4">{message}</p>
      {cta && onCta && (
        <button
          onClick={onCta}
          className="px-6 py-2.5 bg-primary text-white rounded-full font-jakarta font-700 text-sm hover:bg-primary-dim transition-colors"
        >
          {cta}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
