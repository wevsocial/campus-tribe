import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  hint?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  iconPosition = 'left',
  hint,
  className,
  id,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-jakarta font-700 text-on-surface">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && iconPosition === 'left' && (
          <span className="absolute left-3 text-on-surface-variant">{icon}</span>
        )}
        <input
          id={inputId}
          className={clsx(
            'w-full rounded-xl border bg-surface-lowest py-2.5 text-sm text-on-surface placeholder:text-outline-variant transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
            icon && iconPosition === 'left' ? 'pl-10 pr-4' : 'px-4',
            icon && iconPosition === 'right' ? 'pr-10' : '',
            error ? 'border-red-400' : 'border-outline-variant',
            className
          )}
          {...props}
        />
        {icon && iconPosition === 'right' && (
          <span className="absolute right-3 text-on-surface-variant">{icon}</span>
        )}
      </div>
      {error && <p className="text-xs text-red-500 font-jakarta">{error}</p>}
      {hint && !error && <p className="text-xs text-on-surface-variant font-jakarta">{hint}</p>}
    </div>
  );
};

export default Input;
