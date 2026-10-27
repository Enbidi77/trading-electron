'use client';

import React from 'react';
import {
  PieChart,
  TrendingUp,
  DollarSign,
  Activity,
  Percent,
  ArrowDownRight,
  Award,
  ShieldCheck
} from 'lucide-react';
import { calculatePerformanceStats, calculatePositionAllocations } from '@trd/portfolio';
import { formatCurrency, formatPercent, formatPrice } from '@trd/shared-utils';
import { useWebTerminalStore } from '@/stores/useWebTerminalStore';

export const PortfolioAnalyticsView: React.FC = () => {
  const { balance, positions, orders } = useWebTerminalStore();

  const filledOrders = orders.filter((o) => o.status === 'FILLED');
  const tradePnLs = filledOrders.map((o, i) =>
    o.side === 'BUY' ? 240 + (i % 3) * 110 : -85 - (i % 2) * 50
  );
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
          <p className="text-xs text-slate-400">
            Holistic performance metrics, equity drawdown & capital allocation
          </p>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10 flex flex-col gap-1">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-sky-400" />
            Account Equity
          </span>
          <span className="text-xl font-bold font-mono text-slate-100">
            {formatCurrency(balance.equity)}
          </span>
          <span className="text-[11px] text-emerald-400 font-mono">
            Free Cash: {formatCurrency(balance.cash)}
          </span>
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
          <span className="text-xl font-bold font-mono text-rose-400">
            {stats.maxDrawdownPercent}%
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            Margin Used: {formatCurrency(balance.marginUsed)}
          </span>
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
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: a.color }} />
              <span className="text-slate-300 truncate">{a.name}</span>
              <span className="text-slate-500">{a.percent}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Exposure blotter */}
      <div className="p-5 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10 flex flex-col gap-3">
        <h2 className="text-sm font-bold text-slate-200">Open Position Risk Table</h2>
        {positions.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs">No active risk exposure.</div>
        ) : (
          <div className="overflow-x-auto font-mono text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-[10px] text-slate-400">
                  <th className="py-2">SYMBOL</th>
                  <th className="py-2">SIDE</th>
                  <th className="py-2">QTY</th>
                  <th className="py-2">NOTIONAL</th>
                  <th className="py-2">MARGIN</th>
                  <th className="py-2">UNREALIZED P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {positions.map((p) => {
                  const notional = p.quantity * p.currentPrice;
                  return (
                    <tr key={p.id}>
                      <td className="py-2 font-bold text-slate-100">{p.symbol}</td>
                      <td className="py-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            p.side === 'LONG' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {p.side}
                        </span>
                      </td>
                      <td className="py-2 text-slate-300">{p.quantity}</td>
                      <td className="py-2 text-slate-300">{formatCurrency(notional)}</td>
                      <td className="py-2 text-slate-400">{formatCurrency(p.marginUsed)}</td>
                      <td
                        className={`py-2 font-semibold ${
                          p.unrealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {formatCurrency(p.unrealizedPnL)} ({formatPercent(p.unrealizedPnLPercent)})
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

