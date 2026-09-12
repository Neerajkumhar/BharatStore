import React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'destructive' | 'info' | 'outline';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-900 text-white border-transparent',
  success: 'bg-success-bg text-success-text border-success-border',
  warning: 'bg-warning-bg text-warning-text border-warning-border',
  error: 'bg-error-bg text-error-text border-error-border',
  destructive: 'bg-error-bg text-error-text border-error-border',
  info: 'bg-info-bg text-info-text border-info-border',
  outline: 'bg-transparent text-slate-700 border-slate-300',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-2xs px-2 py-0.5 rounded-xs font-semibold tracking-wide uppercase',
  md: 'text-xs px-2.5 py-0.5 rounded-xs font-semibold tracking-wide',
};

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center border transition-colors select-none font-mono',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';
