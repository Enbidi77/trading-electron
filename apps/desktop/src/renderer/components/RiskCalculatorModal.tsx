import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';
import { calculatePositionSize } from '@trd/domain';
import { formatCurrency, formatPrice } from '@trd/shared-utils';
import { useTerminalStore } from '../stores/useTerminalStore.js';

export const RiskCalculatorModal: React.FC = () => {
  const {
    riskModalOpen,
    setRiskModalOpen,
    balance,
    activeSymbol,
    instruments,
    latestTicks,
    placeOrder
  } = useTerminalStore();

  const currentInst = instruments.find((i) => i.symbol === activeSymbol);
  const currentTick = latestTicks[activeSymbol];
  const currentPrice = currentTick?.price || 100;
  const precision = currentInst?.pricePrecision || 2;

  const [riskPercent, setRiskPercent] = useState<number>(1.0);
  const [entryPrice, setEntryPrice] = useState<number>(currentPrice);
  const [stopLossPrice, setStopLossPrice] = useState<number>(Number((currentPrice * 0.98).toFixed(precision)));
  const [takeProfitPrice, setTakeProfitPrice] = useState<number>(Number((currentPrice * 1.04).toFixed(precision)));

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
              <label className="text-xs text-slate-400 font-medium">Entry Price</label>
              <input
                type="number"
                step="any"
                value={entryPrice}
                onChange={(e) => setEntryPrice(Number(e.target.value))}
                className="mt-1 w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 font-mono text-sm text-slate-100 focus:outline-none focus:border-sky-500/50"
              />
            </div>

            <div>
              <label className="text-xs text-rose-400 font-medium">Stop Loss</label>
              <input
                type="number"
                step="any"
                value={stopLossPrice}
                onChange={(e) => setStopLossPrice(Number(e.target.value))}
                className="mt-1 w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 font-mono text-sm text-slate-100 focus:outline-none focus:border-rose-500/50"
              />
            </div>

            <div>
              <label className="text-xs text-emerald-400 font-medium">Take Profit</label>
              <input
                type="number"
                step="any"
                value={takeProfitPrice}
                onChange={(e) => setTakeProfitPrice(Number(e.target.value))}
                className="mt-1 w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 font-mono text-sm text-slate-100 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* Sizing Results Box */}
          <div className="p-4 rounded-xl bg-black/30 border border-white/10 flex flex-col gap-2 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Max Monetary Risk:</span>
              <span className="text-rose-400 font-semibold text-sm">
                {formatCurrency(sizingResult.maxRiskAmount)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Recommended Position Size:</span>
              <span className="text-sky-400 font-bold text-sm">
                {sizingResult.positionQuantity} {currentInst.baseCurrency}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total Notional Capital:</span>
              <span className="text-slate-200">{formatCurrency(sizingResult.notionalValue)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Reward to Risk Ratio:</span>
              <span className="text-emerald-400 font-bold">1 : {sizingResult.riskRewardRatio}</span>
            </div>
          </div>

          {sizingResult.validationError && (
            <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{sizingResult.validationError}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="h-14 flex items-center justify-end gap-2.5 px-5 bg-black/20 border-t border-white/10">
          <button
            onClick={() => setRiskModalOpen(false)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            disabled={!sizingResult.isValid}
            onClick={handleExecuteTrade}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
          >
            Submit Bracket Order
          </button>
        </div>
      </div>
    </div>
  );
};
