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
  success: 'bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]',
  warning: 'bg-[#fffbeb] text-[#92400e] border-[#fde68a]',
  error: 'bg-[#fef2f2] text-[#991b1b] border-[#fecaca]',
  destructive: 'bg-[#fef2f2] text-[#991b1b] border-[#fecaca]',
  info: 'bg-[#eff6ff] text-[#1e40af] border-[#bfdbfe]',
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
