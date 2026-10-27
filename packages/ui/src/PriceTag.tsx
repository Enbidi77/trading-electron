import React, { useEffect, useRef, useState } from 'react';
import { formatPrice } from '@trd/shared-utils';

export interface PriceTagProps {
  price: number;
  precision?: number;
  className?: string;
  showFlash?: boolean;
}

export const PriceTag: React.FC<PriceTagProps> = ({
  price,
  precision = 2,
  className = '',
  showFlash = true
}) => {
  const prevPriceRef = useRef(price);
  const [flashColor, setFlashColor] = useState<'bull' | 'bear' | null>(null);

  useEffect(() => {
    if (!showFlash) return;
    if (price > prevPriceRef.current) {
      setFlashColor('bull');
      const timer = setTimeout(() => setFlashColor(null), 300);
      prevPriceRef.current = price;
      return () => clearTimeout(timer);
    } else if (price < prevPriceRef.current) {
      setFlashColor('bear');
      const timer = setTimeout(() => setFlashColor(null), 300);
      prevPriceRef.current = price;
      return () => clearTimeout(timer);
    }
  }, [price, showFlash]);

  const flashClass =
    flashColor === 'bull'
      ? 'bg-emerald-500/20 text-emerald-400'
      : flashColor === 'bear'
        ? 'bg-rose-500/20 text-rose-400'
        : 'text-slate-100';

  return (
    <span
      className={`font-mono tabular-nums px-1 rounded transition-colors duration-150 ${flashClass} ${className}`}
    >
      {formatPrice(price, precision)}
    </span>
  );
};
