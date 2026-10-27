'use client';

import React, { useState } from 'react';
import type { OrderSide, OrderType } from '@trd/contracts';
import { formatCurrency, formatPrice } from '@trd/shared-utils';
import { useWebTerminalStore } from '@/stores/useWebTerminalStore';

export const WebOrderTicket: React.FC = () => {
  const { activeSymbol, instruments, latestTicks, placeOrder } = useWebTerminalStore();

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

      <form
        onSubmit={handleSubmit}
        className="flex-1 p-3 flex flex-col justify-between overflow-y-auto gap-2.5"
      >
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
          <div className="flex rounded-lg bg-black/20 p-0.5 border border-white/5 text-[11px]">
            {(['MARKET', 'LIMIT', 'STOP'] as OrderType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setOrderType(t)}
                className={`flex-1 py-1 rounded text-center font-medium transition-colors cursor-pointer ${
                  orderType === t ? 'bg-white/10 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Quantity Input */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Quantity ({currentInst?.baseCurrency})</span>
              <span>Min: {currentInst?.minOrderQty}</span>
            </div>
            <input
              type="number"
              step={currentInst?.lotSize || 0.01}
              min={currentInst?.minOrderQty || 0.001}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-sky-500/50"
            />
          </div>

          {/* Limit Price Input if LIMIT order */}
          {orderType === 'LIMIT' && (
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Limit Price</span>
                <span className="font-mono">Current: {formatPrice(currentPrice, precision)}</span>
              </div>
              <input
                type="number"
                step={currentInst?.tickSize}
                placeholder={String(currentPrice)}
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-sky-500/50"
              />
            </div>
          )}

          {/* Brackets: SL and TP */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
            <div>
              <span className="text-[10px] text-rose-400 font-medium block mb-1">Stop Loss</span>
              <input
                type="number"
                step={currentInst?.tickSize}
                placeholder="Optional"
                value={stopLossPrice}
                onChange={(e) => setStopLossPrice(e.target.value)}
                className="w-full px-2 py-1 rounded bg-white/5 border border-white/10 text-[11px] font-mono text-rose-400 focus:outline-none"
              />
            </div>
            <div>
              <span className="text-[10px] text-emerald-400 font-medium block mb-1">Take Profit</span>
              <input
                type="number"
                step={currentInst?.tickSize}
                placeholder="Optional"
                value={takeProfitPrice}
                onChange={(e) => setTakeProfitPrice(e.target.value)}
                className="w-full px-2 py-1 rounded bg-white/5 border border-white/10 text-[11px] font-mono text-emerald-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Order Summary Box */}
          <div className="p-2.5 rounded-lg bg-black/30 border border-white/5 text-[11px] font-mono flex flex-col gap-1 text-slate-400">
            <div className="flex justify-between">
              <span>Notional:</span>
              <span className="text-slate-200">{formatCurrency(notionalValue)}</span>
            </div>
            <div className="flex justify-between">
              <span>Est. Fee (0.05%):</span>
              <span className="text-slate-200">{formatCurrency(estimatedFee)}</span>
            </div>
            {rrRatio !== null && (
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>R : R Ratio:</span>
                <span>1 : {rrRatio}</span>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px]">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Submit Execution Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-lg ${
            side === 'BUY'
              ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20'
              : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20'
          }`}
        >
          {isSubmitting
            ? 'Sending...'
            : `${side} ${quantity} ${currentInst?.baseCurrency || ''} (${orderType})`}
        </button>
      </form>
    </div>
  );
};

