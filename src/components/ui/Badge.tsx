import React from 'react';
import clsx from 'clsx';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'neutral' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  dot?: boolean;
}

const variantStyles = {
  primary: 'bg-primary-container text-primary',
  secondary: 'bg-secondary-container text-secondary-dim',
  tertiary: 'bg-tertiary-container text-tertiary-dim',
  neutral: 'bg-surface-high text-on-surface-variant',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-600',
};

const dotColors = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  tertiary: 'bg-tertiary',
  neutral: 'bg-on-surface-variant',
  success: 'bg-green-600',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
};

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'sm',
  dot = false,
}) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full font-jakarta font-700',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        variantStyles[variant]
      )}
    >
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {label}
    </span>
  );
};

export default Badge;
