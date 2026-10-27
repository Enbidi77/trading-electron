import React from 'react';
import { formatPrice } from '@trd/shared-utils';
import { useTerminalStore } from '../stores/useTerminalStore.js';

export const OrderBookDOM: React.FC = () => {
  const { activeOrderBook, activeSymbol, instruments, placeOrder, positions } = useTerminalStore();

  const currentInst = instruments.find((i) => i.symbol === activeSymbol);
  const precision = currentInst?.pricePrecision || 2;
  const currentPos = positions.find((p) => p.symbol === activeSymbol);

  if (!activeOrderBook) {
    return (
      <div className="w-full h-full flex items-center justify-center text-xs text-slate-500 bg-[#090d16]/75 backdrop-blur-xl border border-white/10 rounded-xl p-3">
        Connecting to Order Book...
      </div>
    );
  }

  const { bids, asks } = activeOrderBook;
  const bestBid = bids[0]?.price || 0;
  const bestAsk = asks[0]?.price || 0;
  const spread = bestAsk > 0 && bestBid > 0 ? bestAsk - bestBid : 0;

  // Max cumulative size for depth bar width percentage
  const maxBidTotal = bids[bids.length - 1]?.total || 1;
  const maxAskTotal = asks[asks.length - 1]?.total || 1;
  const maxTotal = Math.max(maxBidTotal, maxAskTotal, 1);

  const handleQuickBuy = () => {
    placeOrder({
      symbol: activeSymbol,
      side: 'BUY',
      type: 'MARKET',
      quantity: currentInst?.minOrderQty || 1
    });
  };

  const handleQuickSell = () => {
    placeOrder({
      symbol: activeSymbol,
      side: 'SELL',
      type: 'MARKET',
      quantity: currentInst?.minOrderQty || 1
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#090d16]/85 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden select-none">
      {/* Top Header Bar */}
      <div className="h-8 flex items-center justify-between px-3 bg-white/5 border-b border-white/5 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">Market Depth (DOM)</span>
          <span className="text-[10px] text-slate-400 font-mono">[{activeSymbol}]</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
          <span>Spread: <strong className="text-slate-200">{formatPrice(spread, precision)}</strong></span>
        </div>
      </div>

      {/* Ladder Columns Header */}
      <div className="grid grid-cols-4 px-2 py-1 bg-black/20 border-b border-white/5 text-[10px] font-mono text-slate-400">
        <span className="text-left">BID QTY</span>
        <span className="text-right">BID</span>
        <span className="text-left pl-2">ASK</span>
        <span className="text-right">ASK QTY</span>
      </div>

      {/* Book Rows */}
      <div className="flex-1 overflow-y-auto font-mono text-[11px] divide-y divide-white/[0.03]">
        {bids.slice(0, 10).map((bid, i) => {
          const ask = asks[i];
          const bidWidth = Math.min(100, (bid.total / maxTotal) * 100);
          const askWidth = ask ? Math.min(100, (ask.total / maxTotal) * 100) : 0;

          return (
            <div key={i} className="grid grid-cols-4 px-2 py-0.5 items-center relative hover:bg-white/5 transition-colors">
              {/* Bid side depth visual bar */}
              <div
                className="absolute top-0 bottom-0 left-0 bg-emerald-500/10 pointer-events-none transition-all duration-150"
                style={{ width: `${bidWidth / 2}%` }}
              />

              {/* Ask side depth visual bar */}
              <div
                className="absolute top-0 bottom-0 right-0 bg-rose-500/10 pointer-events-none transition-all duration-150"
                style={{ width: `${askWidth / 2}%` }}
              />

              {/* Values */}
              <span className="text-left text-slate-400 relative z-10">{bid.size}</span>
              <span className="text-right text-emerald-400 font-semibold relative z-10">
                {formatPrice(bid.price, precision)}
              </span>
              <span className="text-left pl-2 text-rose-400 font-semibold relative z-10">
                {ask ? formatPrice(ask.price, precision) : '—'}
              </span>
              <span className="text-right text-slate-400 relative z-10">{ask ? ask.size : '—'}</span>
            </div>
          );
        })}
      </div>

      {/* Position Status bar (if open position exists) */}
      {currentPos && (
        <div className="px-3 py-1 bg-white/5 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-400">Position: <strong className={currentPos.side === 'LONG' ? 'text-emerald-400' : 'text-rose-400'}>{currentPos.side} {currentPos.quantity}</strong></span>
          <span className="text-slate-400">Avg: <strong>{formatPrice(currentPos.avgEntryPrice, precision)}</strong></span>
          <span className={currentPos.unrealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
            ${currentPos.unrealizedPnL.toFixed(2)}
          </span>
        </div>
      )}

      {/* Quick Buy/Sell Buttons at Bottom */}
      <div className="p-2 bg-black/30 border-t border-white/10 grid grid-cols-2 gap-2">
        <button
          onClick={handleQuickSell}
          className="flex flex-col items-center justify-center py-2 px-3 rounded-lg bg-rose-600/80 hover:bg-rose-500 text-white font-mono transition-all active:scale-[0.98] cursor-pointer shadow-lg shadow-rose-600/20"
        >
          <span className="text-[10px] text-rose-200 uppercase tracking-wider font-sans font-semibold">SELL (BID)</span>
          <span className="text-sm font-bold">{formatPrice(bestBid, precision)}</span>
        </button>

        <button
          onClick={handleQuickBuy}
          className="flex flex-col items-center justify-center py-2 px-3 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white font-mono transition-all active:scale-[0.98] cursor-pointer shadow-lg shadow-emerald-600/20"
        >
          <span className="text-[10px] text-emerald-200 uppercase tracking-wider font-sans font-semibold">BUY (ASK)</span>
          <span className="text-sm font-bold">{formatPrice(bestAsk, precision)}</span>
        </button>
      </div>
    </div>
  );
};
