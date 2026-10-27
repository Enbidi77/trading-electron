'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Activity, BarChart2, Maximize2, Sparkles, TrendingUp } from 'lucide-react';
import { ChartController } from '@trd/chart-core';
import { SimulatedMarketDataProvider } from '@trd/market-data-providers';
import type { Candle, Timeframe } from '@trd/contracts';
import { formatCurrency, formatPercent, formatPrice } from '@trd/shared-utils';

export function InteractiveChartPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<ChartController | null>(null);
  const [timeframe, setTimeframe] = useState<Timeframe>('1h');
  const [currentPrice, setCurrentPrice] = useState<number>(94250.0);
  const [hoverPrice, setHoverPrice] = useState<number | null>(null);
  const [changePct, setChangePct] = useState<number>(3.84);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !containerRef.current) return;

    const controller = new ChartController({
      container: containerRef.current,
      theme: 'dark',
      onCrosshairMove: ({ price }) => {
        if (price) setHoverPrice(price);
      }
    });
    controllerRef.current = controller;

    const provider = new SimulatedMarketDataProvider();
    let isSubscribed = true;

    provider.connect().then(async () => {
      if (!isSubscribed) return;
      const candles = await provider.getHistoricalCandles('BTC/USD', timeframe, 120);
      if (!isSubscribed) return;

      controller.setData(candles);
      const lastCandle = candles[candles.length - 1];
      if (lastCandle) {
        setCurrentPrice(lastCandle.close);
        const firstCandle = candles[0];
        if (firstCandle) {
          const pct = ((lastCandle.close - firstCandle.open) / firstCandle.open) * 100;
          setChangePct(Number(pct.toFixed(2)));
        }
      }

      // Stream live ticks
      provider.subscribeTicks('BTC/USD', (tick) => {
        if (!isSubscribed) return;
        setCurrentPrice(tick.price);
        controller.updateCandle({
          time: Math.floor(tick.timestamp / 3600) * 3600,
          open: tick.price * 0.999,
          high: Math.max(tick.price, tick.price * 1.001),
          low: Math.min(tick.price, tick.price * 0.998),
          close: tick.price,
          volume: tick.size
        });
      });
    });

    return () => {
      isSubscribed = false;
      controller.destroy();
    };
  }, [isClient, timeframe]);

  return (
    <div className="w-full rounded-2xl bg-[#090d16]/90 backdrop-blur-2xl border border-white/10 shadow-2xl p-4 flex flex-col gap-3">
      {/* Chart Top Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-bold text-amber-400 text-xs">
            ₿
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">BTC / USD</span>
              <span className="text-[10px] text-slate-400 font-mono">Bitcoin Perpetual</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
                LIVE SIMULATED
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-lg font-bold font-mono text-white tracking-tight">
                {formatCurrency(hoverPrice || currentPrice)}
              </span>
              <span
                className={`text-xs font-mono font-medium px-1.5 py-0.5 rounded ${
                  changePct >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                }`}
              >
                {formatPercent(changePct)}
              </span>
            </div>
          </div>
        </div>

        {/* Timeframe Selectors */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
          {(['15m', '1h', '4h', '1D'] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                timeframe === tf
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative w-full h-[380px] rounded-xl overflow-hidden bg-[#070a11]/60">
        {!isClient && (
          <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
            Initializing WebGPU / Canvas Chart...
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" />
      </div>

      {/* Interactive Tool Badges */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            EMA 20
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            EMA 50
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Volume Histogram
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Interactive Crosshair & Hover Tooltip Enabled</span>
        </div>
      </div>
    </div>
  );
}

