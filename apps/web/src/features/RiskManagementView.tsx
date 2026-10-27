'use client';

import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Scale, Lock, DollarSign } from 'lucide-react';
import { calculatePositionSize } from '@trd/domain';
import { formatCurrency, formatPercent, formatPrice } from '@trd/shared-utils';
import { useWebTerminalStore } from '@/stores/useWebTerminalStore';

export const RiskManagementView: React.FC = () => {
  const { balance, positions, activeSymbol, instruments, latestTicks, placeOrder } =
    useWebTerminalStore();

  const currentInst = instruments.find((i) => i.symbol === activeSymbol);
  const currentTick = latestTicks[activeSymbol];
  const currentPrice = currentTick?.price || 100;
  const precision = currentInst?.pricePrecision || 2;

  const [riskPercent, setRiskPercent] = useState<number>(1.0);
  const [entryPrice, setEntryPrice] = useState<number>(currentPrice);
  const [stopLossPrice, setStopLossPrice] = useState<number>(
    Number((currentPrice * 0.98).toFixed(precision))
  );
  const [takeProfitPrice, setTakeProfitPrice] = useState<number>(
    Number((currentPrice * 1.04).toFixed(precision))
  );

  const sizingResult = currentInst
    ? calculatePositionSize({
        accountEquity: balance.equity,
        riskPercent,
        entryPrice,
        stopLossPrice,
        takeProfitPrice,
        instrument: currentInst
      })
    : null;

  const totalNotionalExposure = positions.reduce(
    (acc, p) => acc + p.quantity * p.currentPrice,
    0
  );
  const leverageUsed =
    balance.equity > 0 ? (totalNotionalExposure / balance.equity).toFixed(2) : '0.00';
  const marginUtilizationPct =
    balance.equity > 0 ? ((balance.marginUsed / balance.equity) * 100).toFixed(1) : '0.0';

  return (
    <div className="w-full h-full flex flex-col p-4 bg-[#070a11] gap-4 overflow-y-auto select-none">
      {/* Header */}
      <div className="flex items-center gap-2.5 p-4 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10">
        <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-base text-slate-100">Risk Engine & Capital Allocation</h1>
          <p className="text-xs text-slate-400">
            Real-time portfolio exposure, leverage bounds, margin utilization, and position sizing
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10 flex flex-col gap-1">
          <span className="text-xs text-slate-400">Account Equity</span>
          <span className="text-xl font-bold font-mono text-slate-100">
            {formatCurrency(balance.equity)}
          </span>
          <span className="text-[11px] text-emerald-400 font-mono">
            Free Margin: {formatCurrency(balance.freeMargin)}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10 flex flex-col gap-1">
          <span className="text-xs text-slate-400">Total Notional Exposure</span>
          <span className="text-xl font-bold font-mono text-sky-400">
            {formatCurrency(totalNotionalExposure)}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            Across {positions.length} active positions
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10 flex flex-col gap-1">
          <span className="text-xs text-slate-400">Effective Leverage</span>
          <span className="text-xl font-bold font-mono text-slate-100">{leverageUsed}x</span>
          <span className="text-[11px] text-emerald-400 font-mono">Max Permitted: 5.00x</span>
        </div>

        <div className="p-4 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10 flex flex-col gap-1">
          <span className="text-xs text-slate-400">Margin Utilization</span>
          <span
            className={`text-xl font-bold font-mono ${
              Number(marginUtilizationPct) > 75 ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {marginUtilizationPct}%
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            Used: {formatCurrency(balance.marginUsed)}
          </span>
        </div>
      </div>

      {/* Position Sizer Card */}
      <div className="p-5 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10 flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-bold text-slate-200">
              Optimal Position Sizer for {activeSymbol}
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Mark: {formatPrice(currentPrice, precision)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-slate-400 font-medium">Risk Budget (%)</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="10"
              value={riskPercent}
              onChange={(e) => setRiskPercent(Number(e.target.value))}
              className="mt-1 w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 font-mono text-xs text-slate-100 focus:outline-none focus:border-sky-500/50"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium">Planned Entry</label>
            <input
              type="number"
              step={currentInst?.tickSize}
              value={entryPrice}
              onChange={(e) => setEntryPrice(Number(e.target.value))}
              className="mt-1 w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 font-mono text-xs text-slate-100 focus:outline-none focus:border-sky-500/50"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium">Stop Loss Price</label>
            <input
              type="number"
              step={currentInst?.tickSize}
              value={stopLossPrice}
              onChange={(e) => setStopLossPrice(Number(e.target.value))}
              className="mt-1 w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 font-mono text-xs text-rose-400 focus:outline-none focus:border-rose-500/50"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium">Take Profit Price</label>
            <input
              type="number"
              step={currentInst?.tickSize}
              value={takeProfitPrice}
              onChange={(e) => setTakeProfitPrice(Number(e.target.value))}
              className="mt-1 w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 font-mono text-xs text-emerald-400 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        {sizingResult && (
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[11px]">MAX CAPITAL RISK</span>
              <span className="text-base font-bold text-rose-400">
                {formatCurrency(sizingResult.maxRiskAmount)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">POSITION UNITS</span>
              <span className="text-base font-bold text-sky-400">
                {sizingResult.positionQuantity} {currentInst?.baseCurrency}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">NOTIONAL VALUE</span>
              <span className="text-base font-bold text-slate-200">
                {formatCurrency(sizingResult.notionalValue)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">RISK : REWARD</span>
              <span className="text-base font-bold text-emerald-400">
                1 : {sizingResult.riskRewardRatio.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

