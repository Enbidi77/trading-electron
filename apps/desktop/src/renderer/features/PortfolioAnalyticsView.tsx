import React from 'react';
import { PieChart, TrendingUp, DollarSign, Activity, Percent, ArrowDownRight, Award } from 'lucide-react';
import { calculatePerformanceStats, calculatePositionAllocations } from '@trd/portfolio';
import { formatCurrency, formatPercent, formatPrice } from '@trd/shared-utils';
import { useTerminalStore } from '../stores/useTerminalStore.js';

export const PortfolioAnalyticsView: React.FC = () => {
  const { balance, positions, orders } = useTerminalStore();

  const filledOrders = orders.filter((o) => o.status === 'FILLED');
  // Simulated trade PnLs
  const tradePnLs = filledOrders.map((o, i) => (o.side === 'BUY' ? 240 + (i % 3) * 110 : -85 - (i % 2) * 50));
  const stats = calculatePerformanceStats(tradePnLs);
  const allocations = calculatePositionAllocations(positions, balance.cash);

  return (
    <div className="w-full h-full flex flex-col p-4 bg-[#070a11] gap-4 overflow-y-auto select-none">
      {/* Header */}
      <div className="flex items-center gap-2.5 p-4 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10">
        <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
          <PieChart className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-base text-slate-100">Portfolio & Risk Analytics</h1>
          <p className="text-xs text-slate-400">Holistic performance metrics, equity drawdown & capital allocation</p>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10 flex flex-col gap-1">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-sky-400" />
            Account Equity
          </span>
          <span className="text-xl font-bold font-mono text-slate-100">{formatCurrency(balance.equity)}</span>
          <span className="text-[11px] text-emerald-400 font-mono">Free Cash: {formatCurrency(balance.cash)}</span>
        </div>

        <div className="p-4 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10 flex flex-col gap-1">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            Total Realized P&L
          </span>
          <span
            className={`text-xl font-bold font-mono ${
              balance.realizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formatCurrency(balance.realizedPnL)}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            Unrealized: <strong className="text-slate-200">{formatCurrency(balance.unrealizedPnL)}</strong>
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10 flex flex-col gap-1">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            Win Rate / Profit Factor
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-emerald-400">{stats.winRate}%</span>
            <span className="text-xs text-slate-400 font-mono">PF: {stats.profitFactor}</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Wins: {stats.winningTrades} / Losses: {stats.losingTrades}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10 flex flex-col gap-1">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
            Peak Drawdown
          </span>
          <span className="text-xl font-bold font-mono text-rose-400">{stats.maxDrawdownPercent}%</span>
          <span className="text-[11px] text-slate-400 font-mono">Margin Used: {formatCurrency(balance.marginUsed)}</span>
        </div>
      </div>

      {/* Asset Allocation Breakdown */}
      <div className="p-5 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10 flex flex-col gap-3">
        <h2 className="text-sm font-bold text-slate-200">Capital & Position Allocation</h2>

        {/* Visual Allocation Bar */}
        <div className="w-full h-4 rounded-full overflow-hidden flex bg-white/5 border border-white/10">
          {allocations.map((a, i) => (
            <div
              key={i}
              title={`${a.name}: ${a.percent}%`}
              className="h-full transition-all duration-300"
              style={{ width: `${a.percent}%`, backgroundColor: a.color }}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {allocations.map((a, i) => (
            <div key={i} className="flex items-center gap-2 font-mono text-xs">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: a.color }} />
              <div className="flex flex-col">
                <span className="font-semibold text-slate-200">{a.name}</span>
                <span className="text-[11px] text-slate-400">
                  {formatCurrency(a.value)} ({a.percent}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
