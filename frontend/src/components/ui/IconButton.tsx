import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string; // Required for accessibility (aria-label)
  variant?: 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  tooltip?: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      label,
      variant = 'ghost',
      size = 'md',
      tooltip,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'relative group inline-flex items-center justify-center rounded-full transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/30 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95';

    const variants = {
      ghost: 'text-slate-500 hover:text-slate-800 hover:bg-slate-100',
      danger: 'text-slate-400 hover:text-red-600 hover:bg-red-50',
      outline: 'text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300',
    };

    const sizes = {
      sm: 'w-7 h-7 text-xs',
      md: 'w-8 h-8 text-sm',
      lg: 'w-10 h-10 text-base',
    };

    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        disabled={disabled}
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        <span className="shrink-0">{icon}</span>
        {tooltip && (
          <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-[11px] font-medium rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30">
            {tooltip}
          </span>
        )}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
