import React from 'react';
import clsx from 'clsx';

interface StatCardProps {
  value: string | number;
  label: string;
  trend?: number;
  icon?: string;
  color?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'neutral';
  className?: string;
}

const colorMap = {
  primary: { bg: 'bg-primary-container', text: 'text-primary', icon: 'text-primary' },
  secondary: { bg: 'bg-secondary-container', text: 'text-secondary-dim', icon: 'text-secondary' },
  tertiary: { bg: 'bg-tertiary-container', text: 'text-tertiary-dim', icon: 'text-tertiary' },
  danger: { bg: 'bg-red-50', text: 'text-red-600', icon: 'text-red-500' },
  neutral: { bg: 'bg-surface-low', text: 'text-on-surface', icon: 'text-on-surface-variant' },
};

export const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  trend,
  icon,
  color = 'primary',
  className,
}) => {
  const c = colorMap[color];
  return (
    <div className={clsx('bg-surface-lowest rounded-xl border border-outline-variant/50 shadow-float p-5', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-3xl font-lexend font-900 text-on-surface">{value}</p>
          <p className="mt-1 text-sm font-jakarta text-on-surface-variant">{label}</p>
        </div>
        {icon && (
          <span className={clsx('material-symbols-outlined text-2xl p-2 rounded-xl', c.bg, c.icon)}>
            {icon}
          </span>
        )}
      </div>
      {trend !== undefined && (
        <p className={clsx('mt-3 text-xs font-jakarta font-700', trend >= 0 ? 'text-tertiary' : 'text-red-500')}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last week
        </p>
      )}
    </div>
  );
};

export default StatCard;
