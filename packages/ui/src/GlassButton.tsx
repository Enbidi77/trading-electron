import React from 'react';

export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'bull' | 'bear';
  size?: 'sm' | 'md' | 'lg';
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  className = '',
  variant = 'secondary',
  size = 'md',
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3.5 py-1.5 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5'
  };

  const variantStyles = {
    primary:
      'bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/20 border border-sky-400/30',
    secondary:
      'bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]',
    ghost:
      'bg-transparent hover:bg-white/10 text-slate-400 hover:text-white border border-transparent',
    bull: 'bg-emerald-500 hover:bg-emerald-400 text-white font-semibold shadow-lg shadow-emerald-500/20 border border-emerald-400/30',
    bear: 'bg-rose-500 hover:bg-rose-400 text-white font-semibold shadow-lg shadow-rose-500/20 border border-rose-400/30'
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
