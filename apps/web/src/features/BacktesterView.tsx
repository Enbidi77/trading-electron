'use client';

import React, { useState } from 'react';
import { History, Play, CheckCircle, TrendingUp, Award, ArrowDownRight } from 'lucide-react';
import { runSmaCrossoverBacktest, type BacktestResult } from '@trd/backtesting';
import { formatCurrency, formatPercent, formatPrice, formatTime } from '@trd/shared-utils';
import { useWebTerminalStore } from '@/stores/useWebTerminalStore';

export const BacktesterView: React.FC = () => {
  const { activeSymbol, marketProvider } = useWebTerminalStore();

  const [fastPeriod, setFastPeriod] = useState<number>(9);
  const [slowPeriod, setSlowPeriod] = useState<number>(21);
  const [initialCapital, setInitialCapital] = useState<number>(100000);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);

  const handleRunBacktest = async () => {
    setIsRunning(true);
    try {
      const candles = await marketProvider.getHistoricalCandles(activeSymbol, '1h', 300);
      const res = runSmaCrossoverBacktest(candles, fastPeriod, slowPeriod, initialCapital);
      setResult(res);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-4 bg-[#070a11] gap-4 overflow-y-auto select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base text-slate-100">Strategy Backtester</h1>
            <p className="text-xs text-slate-400">
              Evaluate algorithmic trading rules against historical candles for {activeSymbol}
            </p>
          </div>
        </div>

        {/* Parameters & Run Button */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5">
            <label className="text-slate-400">Fast MA:</label>
            <input
              type="number"
              value={fastPeriod}
              onChange={(e) => setFastPeriod(Number(e.target.value))}
              className="w-16 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 font-mono text-slate-200 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-slate-400">Slow MA:</label>
            <input
              type="number"
              value={slowPeriod}
              onChange={(e) => setSlowPeriod(Number(e.target.value))}
              className="w-16 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 font-mono text-slate-200 focus:outline-none"
            />
          </div>

          <button
            onClick={handleRunBacktest}
            disabled={isRunning}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold flex items-center gap-1.5 shadow-lg shadow-sky-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunning ? 'Simulating...' : 'Run Simulation'}</span>
          </button>
        </div>
      </div>

      {result ? (
        <div className="flex flex-col gap-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10 flex flex-col gap-1">
              <span className="text-xs text-slate-400">Total Return</span>
              <span
                className={`text-xl font-bold font-mono ${
                  result.stats.totalRealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatCurrency(result.stats.totalRealizedPnL)}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {formatPercent((result.stats.totalRealizedPnL / initialCapital) * 100)} return
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10 flex flex-col gap-1">
              <span className="text-xs text-slate-400">Win Rate</span>
              <span className="text-xl font-bold font-mono text-emerald-400">
                {result.stats.winRate}%
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {result.stats.winningTrades} Wins / {result.stats.losingTrades} Losses
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10 flex flex-col gap-1">
              <span className="text-xs text-slate-400">Profit Factor</span>
              <span className="text-xl font-bold font-mono text-slate-100">
                {result.stats.profitFactor}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Avg Win: {formatCurrency(result.stats.averageWin)}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10 flex flex-col gap-1">
              <span className="text-xs text-slate-400">Max Drawdown</span>
              <span className="text-xl font-bold font-mono text-rose-400">
                {result.stats.maxDrawdownPercent}%
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Avg Loss: {formatCurrency(result.stats.averageLoss)}
              </span>
            </div>
          </div>

          {/* Trade Log Table */}
          <div className="p-5 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10 flex flex-col gap-3">
            <h2 className="text-sm font-bold text-slate-200">
              Execution Log ({result.trades.length} Trades)
            </h2>
            <div className="max-h-80 overflow-y-auto font-mono text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] text-slate-400">
                    <th className="py-2">ENTRY TIME</th>
                    <th className="py-2">EXIT TIME</th>
                    <th className="py-2">SIDE</th>
                    <th className="py-2">ENTRY PRICE</th>
                    <th className="py-2">EXIT PRICE</th>
                    <th className="py-2 text-right">TRADE P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {result.trades.map((t, idx) => (
                    <tr key={idx} className="hover:bg-white/5">
                      <td className="py-2 text-slate-400">{formatTime(t.entryTime)}</td>
                      <td className="py-2 text-slate-400">{formatTime(t.exitTime)}</td>
                      <td className="py-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            t.side === 'LONG'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {t.side}
                        </span>
                      </td>
                      <td className="py-2 text-slate-300">{formatPrice(t.entryPrice)}</td>
                      <td className="py-2 text-slate-300">{formatPrice(t.exitPrice)}</td>
                      <td
                        className={`py-2 text-right font-semibold ${
                          t.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {formatCurrency(t.pnl)} ({formatPercent(t.pnlPercent)})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-12 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10 text-center">
          <History className="w-12 h-12 text-slate-600 mb-3" />
          <h2 className="text-base font-bold text-slate-300">Ready to Backtest</h2>
          <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
            Click &quot;Run Simulation&quot; above to backtest dual moving average crossovers against historical bars.
          </p>
          <button
            onClick={handleRunBacktest}
            className="px-5 py-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 text-xs font-semibold border border-sky-500/30 transition-all cursor-pointer"
          >
            Run Default Backtest
          </button>
        </div>
      )}
    </div>
  );
};
