import React, { useState } from 'react';
import type { OrderSide, OrderType } from '@trd/contracts';
import { formatCurrency, formatPrice } from '@trd/shared-utils';
import { GlassButton, GlassInput } from '@trd/ui';
import { useTerminalStore } from '../stores/useTerminalStore.js';

export const OrderTicket: React.FC = () => {
  const { activeSymbol, instruments, latestTicks, placeOrder } = useTerminalStore();

  const currentInst = instruments.find((i) => i.symbol === activeSymbol);
  const currentTick = latestTicks[activeSymbol];
  const currentPrice = currentTick?.price || 100;
  const precision = currentInst?.pricePrecision || 2;

  const [side, setSide] = useState<OrderSide>('BUY');
  const [orderType, setOrderType] = useState<OrderType>('MARKET');
  const [quantity, setQuantity] = useState<number>(currentInst?.minOrderQty || 1);
  const [limitPrice, setLimitPrice] = useState<string>('');
  const [stopLossPrice, setStopLossPrice] = useState<string>('');
  const [takeProfitPrice, setTakeProfitPrice] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const effPrice = orderType === 'LIMIT' && Number(limitPrice) > 0 ? Number(limitPrice) : currentPrice;
  const notionalValue = quantity * effPrice;
  const estimatedFee = notionalValue * 0.0005; // 0.05%

  // Calculate Risk / Reward if both SL and TP provided
  let rrRatio: number | null = null;
  if (Number(stopLossPrice) > 0 && Number(takeProfitPrice) > 0) {
    const sl = Number(stopLossPrice);
    const tp = Number(takeProfitPrice);
    const risk = Math.abs(effPrice - sl);
    const reward = Math.abs(tp - effPrice);
    if (risk > 0) {
      rrRatio = Number((reward / risk).toFixed(2));
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (quantity <= 0) {
      setErrorMsg('Quantity must be greater than zero');
      return;
    }

    try {
      setIsSubmitting(true);
      await placeOrder({
        symbol: activeSymbol,
        side,
        type: orderType,
        quantity,
        limitPrice: orderType === 'LIMIT' ? Number(limitPrice) : undefined,
        stopLossPrice: Number(stopLossPrice) > 0 ? Number(stopLossPrice) : undefined,
        takeProfitPrice: Number(takeProfitPrice) > 0 ? Number(takeProfitPrice) : undefined
      });

      // Reset
      setLimitPrice('');
      setStopLossPrice('');
      setTakeProfitPrice('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#090d16]/85 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden select-none">
      <div className="h-8 flex items-center justify-between px-3 bg-white/5 border-b border-white/5 text-xs">
        <span className="font-semibold text-slate-200">Trade Ticket</span>
        <span className="text-[10px] text-slate-400 font-mono">[{activeSymbol}]</span>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 p-3 flex flex-col justify-between overflow-y-auto gap-2.5">
        <div className="flex flex-col gap-2.5">
          {/* Buy / Sell Selector */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-black/20 border border-white/5">
            <button
              type="button"
              onClick={() => setSide('BUY')}
              className={`py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                side === 'BUY'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              BUY / LONG
            </button>
            <button
              type="button"
              onClick={() => setSide('SELL')}
              className={`py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                side === 'SELL'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              SELL / SHORT
            </button>
          </div>

          {/* Order Type Tabs */}
          <div className="grid grid-cols-3 gap-1 p-0.5 rounded-lg bg-black/20 border border-white/5 text-xs">
            {(['MARKET', 'LIMIT', 'STOP'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setOrderType(t)}
                className={`py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                  orderType === t ? 'bg-white/15 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Quantity */}
          <div>
            <label className="text-[11px] font-medium text-slate-400">Order Quantity</label>
            <div className="flex items-center gap-1.5 mt-1">
              <input
                type="number"
                step="any"
                min={currentInst?.minOrderQty || 0.001}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(0, Number(e.target.value)))}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-slate-100 focus:outline-none focus:border-sky-500/50"
              />
              <span className="text-xs font-mono text-slate-400 px-1">{currentInst?.baseCurrency}</span>
            </div>
          </div>

          {/* Limit Price (if LIMIT) */}
          {orderType === 'LIMIT' && (
            <div>
              <label className="text-[11px] font-medium text-slate-400">Limit Price</label>
              <input
                type="number"
                step="any"
                placeholder={formatPrice(currentPrice, precision)}
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-slate-100 focus:outline-none focus:border-sky-500/50"
              />
            </div>
          )}

          {/* Brackets: Take Profit & Stop Loss */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
            <div>
              <label className="text-[10px] font-medium text-emerald-400">Take Profit</label>
              <input
                type="number"
                step="any"
                placeholder="Optional"
                value={takeProfitPrice}
                onChange={(e) => setTakeProfitPrice(e.target.value)}
                className="w-full mt-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-rose-400">Stop Loss</label>
              <input
                type="number"
                step="any"
                placeholder="Optional"
                value={stopLossPrice}
                onChange={(e) => setStopLossPrice(e.target.value)}
                className="w-full mt-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-slate-100 focus:outline-none focus:border-rose-500/50"
              />
            </div>
          </div>

          {/* Order Summary & Notional */}
          <div className="p-2 rounded-lg bg-black/20 border border-white/5 flex flex-col gap-1 text-[11px] font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Notional Value:</span>
              <span className="text-slate-200">{formatCurrency(notionalValue)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Est. Commission:</span>
              <span className="text-slate-200">{formatCurrency(estimatedFee)}</span>
            </div>
            {rrRatio !== null && (
              <div className="flex justify-between text-slate-400">
                <span>Reward/Risk Ratio:</span>
                <span className="text-sky-400 font-bold">1 : {rrRatio}</span>
              </div>
            )}
          </div>

          {errorMsg && <div className="text-xs text-rose-400 font-medium px-1">{errorMsg}</div>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider text-white shadow-lg transition-all cursor-pointer active:scale-[0.98] ${
            side === 'BUY'
              ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
              : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
          }`}
        >
          {isSubmitting ? 'Placing Order...' : `${side} ${quantity} ${activeSymbol}`}
        </button>
      </form>
    </div>
  );
};
