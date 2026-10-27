'use client';

import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';
import { calculatePositionSize } from '@trd/domain';
import { formatCurrency, formatPrice } from '@trd/shared-utils';
import { useWebTerminalStore } from '@/stores/useWebTerminalStore';

export const WebRiskCalculatorModal: React.FC = () => {
  const {
    riskModalOpen,
    setRiskModalOpen,
    balance,
    activeSymbol,
    instruments,
    latestTicks,
    placeOrder
  } = useWebTerminalStore();

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

  if (!riskModalOpen || !currentInst) return null;

  const sizingResult = calculatePositionSize({
    accountEquity: balance.equity,
    riskPercent,
    entryPrice,
    stopLossPrice,
    takeProfitPrice,
    instrument: currentInst
  });

  const handleExecuteTrade = async () => {
    if (!sizingResult.isValid || sizingResult.positionQuantity <= 0) return;
    const side = entryPrice > stopLossPrice ? 'BUY' : 'SELL';
    await placeOrder({
      symbol: activeSymbol,
      side,
      type: 'LIMIT',
      quantity: sizingResult.positionQuantity,
      limitPrice: entryPrice,
      stopLossPrice,
      takeProfitPrice
    });
    setRiskModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md select-none p-4">
      <div className="w-full max-w-lg bg-[#0d131f]/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="h-12 flex items-center justify-between px-5 bg-white/5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-sky-500/20 text-sky-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-slate-100">
              Position Sizing & Risk Management
            </span>
          </div>
          <button
            onClick={() => setRiskModalOpen(false)}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Inputs */}
        <div className="p-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 font-medium">Account Equity</label>
              <div className="mt-1 px-3 py-2 rounded-lg bg-black/30 border border-white/5 font-mono text-sm text-slate-200">
                {formatCurrency(balance.equity)}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium">Risk Budget (%)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="10"
                value={riskPercent}
                onChange={(e) => setRiskPercent(Number(e.target.value))}
                className="mt-1 w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 font-mono text-sm text-slate-100 focus:outline-none focus:border-sky-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-400 font-medium">Planned Entry</label>
              <input
                type="number"
                step={currentInst.tickSize}
                value={entryPrice}
                onChange={(e) => setEntryPrice(Number(e.target.value))}
                className="mt-1 w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 font-mono text-xs text-slate-100 focus:outline-none focus:border-sky-500/50"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium">Stop Loss</label>
              <input
                type="number"
                step={currentInst.tickSize}
                value={stopLossPrice}
                onChange={(e) => setStopLossPrice(Number(e.target.value))}
                className="mt-1 w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 font-mono text-xs text-rose-400 focus:outline-none focus:border-rose-500/50"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium">Take Profit</label>
              <input
                type="number"
                step={currentInst.tickSize}
                value={takeProfitPrice}
                onChange={(e) => setTakeProfitPrice(Number(e.target.value))}
                className="mt-1 w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 font-mono text-xs text-emerald-400 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* Sizing Output Box */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Max Dollar Risk:</span>
              <span className="font-mono font-semibold text-rose-400">
                {formatCurrency(sizingResult.maxRiskAmount)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Recommended Units:</span>
              <span className="font-mono font-bold text-sky-400 text-sm">
                {sizingResult.positionQuantity} {currentInst.baseCurrency}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Notional Exposure:</span>
              <span className="font-mono text-slate-200">
                {formatCurrency(sizingResult.notionalValue)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Risk : Reward Ratio:</span>
              <span className="font-mono text-emerald-400 font-semibold">
                1 : {sizingResult.riskRewardRatio.toFixed(2)}
              </span>
            </div>
          </div>

          {sizingResult.validationError && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{sizingResult.validationError}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setRiskModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              disabled={!sizingResult.isValid}
              onClick={handleExecuteTrade}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-40 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
            >
              Send Bracket Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

