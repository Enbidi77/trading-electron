'use client';

import React from 'react';
import { Repeat, ShieldCheck, Wallet, RefreshCw, AlertCircle } from 'lucide-react';
import { WebOrderTicket } from '@/components/WebOrderTicket';
import { WebPositionsAndOrders } from '@/components/WebPositionsAndOrders';
import { formatCurrency, formatPercent } from '@trd/shared-utils';
import { useWebTerminalStore } from '@/stores/useWebTerminalStore';

export const PaperTradingView: React.FC = () => {
  const { balance } = useWebTerminalStore();

  return (
    <div className="w-full h-full flex flex-col p-4 bg-[#070a11] gap-3 overflow-hidden select-none">
      {/* Simulation Banner & Account Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
            <Repeat className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base text-slate-100">Deterministic Paper Trading Blotter</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-semibold font-mono">
                SIMULATION MODE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Zero capital risk execution engine with 0.05% fee accounting and bracket SL/TP automation
            </p>
          </div>
        </div>

        {/* Balance metrics */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex flex-col">
            <span className="text-[10px] text-slate-400">EQUITY</span>
            <span className="font-bold text-slate-100">{formatCurrency(balance.equity)}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex flex-col">
            <span className="text-[10px] text-slate-400">CASH</span>
            <span className="text-slate-300">{formatCurrency(balance.cash)}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex flex-col">
            <span className="text-[10px] text-slate-400">DAILY P&L</span>
            <span className={balance.dailyPnL >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {formatCurrency(balance.dailyPnL)} ({formatPercent(balance.dailyPnLPercent)})
            </span>
          </div>
        </div>
      </div>

      {/* Main split: Order Ticket on left / top, Blotter on right / center */}
      <div className="flex-1 flex flex-col lg:flex-row gap-3 overflow-hidden">
        <div className="w-full lg:w-96 h-80 lg:h-full">
          <WebOrderTicket />
        </div>
        <div className="flex-1 h-full min-h-[300px]">
          <WebPositionsAndOrders />
        </div>
      </div>
    </div>
  );
};

