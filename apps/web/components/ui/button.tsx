import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'default' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 active:bg-slate-950 shadow-xs border border-transparent',
  secondary:
    'bg-white text-slate-900 border border-slate-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 active:bg-slate-100 shadow-xs',
  accent:
    'bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 active:bg-amber-700 shadow-xs border border-transparent',
  outline:
    'bg-transparent text-slate-700 border border-slate-300 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 active:bg-slate-200',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 active:bg-slate-200 border border-transparent',
  destructive:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 active:bg-red-800 shadow-xs border border-transparent',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-md',
  md: 'h-10 px-4 text-sm gap-2 rounded-md',
  default: 'h-10 px-4 text-sm gap-2 rounded-md',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-lg',
  icon: 'h-10 w-10 p-2 justify-center rounded-md',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'default',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isButtonDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isButtonDisabled}
        aria-busy={isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-colors cursor-pointer select-none',
          'focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />
            <span className={cn(size === 'icon' && 'sr-only')}>{children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0 items-center flex">{leftIcon}</span>}
            {children && <span>{children}</span>}
            {rightIcon && <span className="shrink-0 items-center flex">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
