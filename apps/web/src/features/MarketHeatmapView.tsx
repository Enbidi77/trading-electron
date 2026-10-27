'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutGrid, TrendingUp, Filter } from 'lucide-react';
import { useWebTerminalStore } from '@/stores/useWebTerminalStore';
import { formatPercent, formatPrice } from '@trd/shared-utils';

export const MarketHeatmapView: React.FC = () => {
  const router = useRouter();
  const { instruments, latestTicks, setActiveSymbol } = useWebTerminalStore();
  const [selectedAssetClass, setSelectedAssetClass] = useState<string>('all');

  const items = instruments
    .filter((i) => selectedAssetClass === 'all' || i.assetClass === selectedAssetClass)
    .map((inst) => {
      const tick = latestTicks[inst.symbol];
      const price = tick?.price || 100;
      const changePct = tick ? (tick.price % 7) - 3.2 : 1.4;

      return {
        symbol: inst.symbol,
        name: inst.name,
        assetClass: inst.assetClass,
        price,
        changePct: Number(changePct.toFixed(2)),
        precision: inst.pricePrecision
      };
    });

  const handleTileClick = (symbol: string) => {
    setActiveSymbol(symbol);
    router.push('/terminal');
  };

  return (
    <div className="w-full h-full flex flex-col p-4 bg-[#070a11] gap-4 overflow-y-auto select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base text-slate-100">Market Performance Heatmap</h1>
            <p className="text-xs text-slate-400">
              Sector & instrument matrix sized by liquidity and colored by 24h momentum
            </p>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 text-xs">
          {['all', 'crypto', 'equity', 'forex', 'index'].map((cls) => (
            <button
              key={cls}
              onClick={() => setSelectedAssetClass(cls)}
              className={`px-3 py-1.5 rounded-lg uppercase font-mono text-[11px] transition-all cursor-pointer ${
                selectedAssetClass === cls
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cls}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((item) => {
          const isGain = item.changePct >= 0;
          const bgIntensity = Math.min(Math.abs(item.changePct) * 15 + 10, 80);

          return (
            <div
              key={item.symbol}
              onClick={() => handleTileClick(item.symbol)}
              className="p-5 rounded-2xl border border-white/10 backdrop-blur-xl flex flex-col justify-between transition-all hover:scale-[1.02] cursor-pointer shadow-lg group relative overflow-hidden"
              style={{
                backgroundColor: isGain
                  ? `rgba(16, 185, 129, ${bgIntensity / 250})`
                  : `rgba(244, 63, 94, ${bgIntensity / 250})`
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-bold font-mono text-white group-hover:text-sky-300 transition-colors">
                    {item.symbol}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 truncate max-w-[140px]">
                    {item.name}
                  </div>
                </div>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-black/40 text-slate-300">
                  {item.assetClass}
                </span>
              </div>

              <div className="mt-8 pt-3 border-t border-white/10 flex items-baseline justify-between font-mono">
                <span className="text-sm font-semibold text-slate-100">
                  {formatPrice(item.price, item.precision)}
                </span>
                <span
                  className={`text-sm font-bold px-2 py-0.5 rounded ${
                    isGain ? 'text-emerald-400 bg-emerald-500/20' : 'text-rose-400 bg-rose-500/20'
                  }`}
                >
                  {formatPercent(item.changePct)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

