'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';
import { AnimationWrapper } from '../primitives/animation-wrapper';

export interface NewsletterSectionProps {
  config: {
    title?: string;
    subtitle?: string;
    buttonText?: string;
    placeholder?: string;
    animation?: 'none' | 'fade' | 'fade-up' | 'slide-up' | 'scale';
  };
}

export function NewsletterSection({ config }: NewsletterSectionProps) {
  const [value, setValue] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    setSubscribed(true);
  };

  return (
    <section className="py-16 bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <AnimationWrapper animation={config.animation || 'fade-up'}>
          <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
            <Mail className="h-6 w-6" />
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {config.title || 'Join Our VIP Circle'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto font-medium">
            {config.subtitle || 'Subscribe for secret discount codes, early access to new drops, and seasonal updates.'}
          </p>

          {!subscribed ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={config.placeholder || 'Enter your email or phone number...'}
                className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                className="py-3 px-6 bg-amber-500 text-slate-950 font-extrabold text-xs rounded-xl hover:bg-amber-400 transition shadow-md shrink-0"
              >
                {config.buttonText || 'Subscribe'}
              </button>
            </form>
          ) : (
            <div className="p-4 bg-emerald-950/80 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 max-w-md mx-auto">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <span>Thank you for subscribing! Check your inbox soon.</span>
            </div>
          )}
        </AnimationWrapper>
      </div>
    </section>
  );
}
