import React from 'react';

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'subtle' | 'elevated';
  border?: boolean;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className = '',
  variant = 'surface',
  border = true,
  ...props
}) => {
  const variantStyles = {
    surface: 'bg-slate-900/60 dark:bg-[#0d131f]/75 backdrop-blur-xl',
    subtle: 'bg-slate-900/40 dark:bg-[#090d16]/60 backdrop-blur-md',
    elevated: 'bg-slate-800/80 dark:bg-[#131b2e]/85 backdrop-blur-2xl shadow-2xl'
  };

  const borderStyle = border
    ? 'border border-white/10 dark:border-white/10 border-black/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]'
    : '';

  return (
    <div
      className={`rounded-xl transition-all duration-200 ${variantStyles[variant]} ${borderStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
