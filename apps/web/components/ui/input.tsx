import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string | boolean;
  prefixSlot?: React.ReactNode;
  suffixSlot?: React.ReactNode;
  wrapperClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      wrapperClassName,
      type = 'text',
      label,
      helperText,
      error,
      prefixSlot,
      suffixSlot,
      id,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : generatedId);
    const errorMessage = typeof error === 'string' ? error : undefined;
    const isError = Boolean(error);

    return (
      <div className={cn('w-full flex flex-col gap-1.5', wrapperClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-slate-800 flex items-center justify-between"
          >
            <span>
              {label}
              {required && <span className="text-red-500 ml-0.5">*</span>}
            </span>
          </label>
        )}

        <div
          className={cn(
            'group flex items-center w-full h-10 bg-white border rounded-md shadow-xs transition-colors overflow-hidden',
            'focus-within:ring-2 focus-within:ring-amber-600/30 focus-within:border-amber-600',
            disabled && 'bg-slate-50 opacity-60 cursor-not-allowed',
            isError
              ? 'border-red-500 focus-within:ring-red-500 focus-within:border-red-500'
              : 'border-slate-300'
          )}
        >
          {prefixSlot && (
            <div className="inline-flex items-center h-full px-3 bg-slate-50 border-r border-slate-200 text-slate-600 text-xs font-medium shrink-0 select-none">
              {prefixSlot}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            required={required}
            aria-invalid={isError}
            aria-describedby={
              errorMessage
                ? `${inputId}-error`
                : helperText
                ? `${inputId}-helper`
                : undefined
            }
            className={cn(
              'flex-1 min-w-0 h-full px-3 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none',
              'disabled:cursor-not-allowed',
              className
            )}
            {...props}
          />

          {suffixSlot && (
            <div className="inline-flex items-center h-full px-3 bg-slate-50 border-l border-slate-200 text-slate-600 text-xs font-medium shrink-0 select-none">
              {suffixSlot}
            </div>
          )}
        </div>

        {errorMessage ? (
          <p id={`${inputId}-error`} className="text-xs text-red-600 font-medium">
            {errorMessage}
          </p>
        ) : helperText ? (
          <p id={`${inputId}-helper`} className="text-xs text-slate-500">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
