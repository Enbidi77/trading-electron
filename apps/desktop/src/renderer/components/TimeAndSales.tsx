import React from 'react';
import { formatPrice, formatTime } from '@trd/shared-utils';
import { useTerminalStore } from '../stores/useTerminalStore.js';

export const TimeAndSales: React.FC = () => {
  const { recentTrades, activeSymbol, instruments } = useTerminalStore();
  const currentInst = instruments.find((i) => i.symbol === activeSymbol);
  const precision = currentInst?.pricePrecision || 2;

  return (
    <div className="w-full h-full flex flex-col bg-[#090d16]/85 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden select-none">
      <div className="h-8 flex items-center justify-between px-3 bg-white/5 border-b border-white/5 text-xs">
        <span className="font-semibold text-slate-200">Time & Sales (Tape)</span>
        <span className="text-[10px] text-slate-400 font-mono">[{activeSymbol}]</span>
      </div>

      <div className="grid grid-cols-3 px-3 py-1 bg-black/20 border-b border-white/5 text-[10px] font-mono text-slate-400">
        <span className="text-left">TIME</span>
        <span className="text-center">PRICE</span>
        <span className="text-right">SIZE</span>
      </div>

      <div className="flex-1 overflow-y-auto font-mono text-[11px] divide-y divide-white/[0.03]">
        {recentTrades.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500">Awaiting live trade tape prints...</div>
        ) : (
          recentTrades.map((t) => {
            const isBuy = t.side === 'buy';
            return (
              <div
                key={t.id}
                className="grid grid-cols-3 px-3 py-0.5 items-center hover:bg-white/5 transition-colors"
              >
                <span className="text-left text-slate-400 text-[10px]">{formatTime(t.timestamp)}</span>
                <span
                  className={`text-center font-semibold ${isBuy ? 'text-emerald-400' : 'text-rose-400'}`}
                >
                  {formatPrice(t.price, precision)}
                </span>
                <span className="text-right text-slate-300">{t.size}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
