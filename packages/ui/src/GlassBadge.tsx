import React from 'react';

export interface GlassBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'bull' | 'bear' | 'neutral' | 'accent' | 'outline';
}

export const GlassBadge: React.FC<GlassBadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
  ...props
}) => {
  const variantStyles = {
    bull: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
    bear: 'bg-rose-500/15 text-rose-400 border border-rose-500/25',
    neutral: 'bg-slate-700/30 text-slate-300 border border-white/10',
    accent: 'bg-sky-500/15 text-sky-400 border border-sky-500/25',
    outline: 'bg-transparent text-slate-400 border border-white/15'
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono tabular-nums ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
