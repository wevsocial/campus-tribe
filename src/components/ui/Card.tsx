import React from 'react';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary-tinted' | 'secondary-tinted' | 'tertiary-tinted' | 'glass';
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

const variantStyles = {
  default: 'bg-surface-lowest border border-outline-variant/50 shadow-float',
  'primary-tinted': 'bg-primary-container border border-primary/20',
  'secondary-tinted': 'bg-secondary-container border border-secondary/20',
  'tertiary-tinted': 'bg-tertiary-container border border-tertiary/20',
  glass: 'bg-white/60 backdrop-blur-md border border-white/40 shadow-float',
};

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
};

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'rounded-xl transition-all duration-200',
        variantStyles[variant],
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
