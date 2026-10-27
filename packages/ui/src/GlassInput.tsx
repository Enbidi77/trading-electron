import React from 'react';

export interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && <label className="text-xs text-slate-400 font-medium">{label}</label>}
        <input
          ref={ref}
          className={`px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/30 transition-all font-mono ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-rose-400">{error}</span>}
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';
