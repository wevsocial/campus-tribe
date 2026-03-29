import React from 'react';

interface LoadingSkeletonProps {
  rows?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ rows = 3, className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-surface-lowest rounded-xl p-5 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-surface-high rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-surface-high rounded-full w-3/4" />
              <div className="h-3 bg-surface-high rounded-full w-1/2" />
            </div>
            <div className="w-20 h-8 bg-surface-high rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const StatSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="bg-surface-lowest rounded-xl p-5 animate-pulse">
        <div className="h-8 bg-surface-high rounded-full w-1/2 mb-2" />
        <div className="h-4 bg-surface-high rounded-full w-3/4" />
      </div>
    ))}
  </div>
);

export default LoadingSkeleton;
