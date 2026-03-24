import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const variantStyles = {
  primary: 'bg-primary text-white hover:bg-primary-dim shadow-float',
  secondary: 'bg-secondary text-white hover:bg-secondary-dim shadow-float',
  tertiary: 'bg-tertiary text-white hover:bg-tertiary-dim shadow-float',
  ghost: 'bg-transparent text-primary hover:bg-primary-container',
  outline: 'border border-outline-variant text-on-surface bg-transparent hover:bg-surface-low',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-lg',
  lg: 'px-6 py-3.5 text-base rounded-xl',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  iconPosition = 'left',
  children,
  className,
  disabled,
  ...props
}) => {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-jakarta font-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        iconPosition === 'left' && icon
      )}
      {children}
      {!isLoading && iconPosition === 'right' && icon}
    </button>
  );
};

export default Button;
