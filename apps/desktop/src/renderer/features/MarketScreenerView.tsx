import React, { useState } from 'react';
import { Filter, Search, ArrowUpRight, ArrowDownRight, Sliders, ExternalLink } from 'lucide-react';
import type { ScreenerFilter, ScreenerResult } from '@trd/contracts';
import { screenInstruments } from '@trd/screener';
import { formatCompactNumber, formatPercent, formatPrice } from '@trd/shared-utils';
import { useTerminalStore } from '../stores/useTerminalStore.js';

export const MarketScreenerView: React.FC = () => {
  const { instruments, latestTicks, setActiveSymbol, setActiveView } = useTerminalStore();

  const [assetClass, setAssetClass] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [rsiFilter, setRsiFilter] = useState<'any' | 'oversold' | 'overbought'>('any');

  // Build current screener data from live ticks
  const mockScreenerData: ScreenerResult[] = instruments.map((inst) => {
    const tick = latestTicks[inst.symbol];
    const price = tick?.price || 100;
    const changePct = tick ? ((tick.price % 7) - 3.2) : 1.5;
    const change = price * (changePct / 100);

    return {
      symbol: inst.symbol,
      name: inst.name,
      price,
      change24h: Number(change.toFixed(inst.pricePrecision)),
      changePercent24h: Number(changePct.toFixed(2)),
      volume24h: 5000000 + (inst.symbol.charCodeAt(0) * 100000),
      high24h: Number((price * 1.03).toFixed(inst.pricePrecision)),
      low24h: Number((price * 0.97).toFixed(inst.pricePrecision)),
      rsi: 35 + ((inst.symbol.charCodeAt(1) * 3) % 40)
    };
  });

  const filter: ScreenerFilter = {
    assetClass: assetClass === 'all' ? undefined : (assetClass as any),
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    rsiCondition: rsiFilter === 'any' ? undefined : rsiFilter
  };

  const results = screenInstruments(instruments, mockScreenerData, filter);

  return (
    <div className="w-full h-full flex flex-col p-4 bg-[#070a11] gap-3 overflow-hidden select-none">
      {/* Title & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base text-slate-100">Market Screener</h1>
            <p className="text-xs text-slate-400">Scan assets across multi-market technical & momentum indicators</p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <select
            value={assetClass}
            onChange={(e) => setAssetClass(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-200 focus:outline-none"
          >
            <option value="all">All Assets</option>
            <option value="crypto">Crypto</option>
            <option value="equity">Equities</option>
            <option value="forex">Forex</option>
            <option value="index">Indices</option>
          </select>

          <select
            value={rsiFilter}
            onChange={(e) => setRsiFilter(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-200 focus:outline-none"
          >
            <option value="any">RSI (Any)</option>
            <option value="oversold">RSI Oversold (&lt; 30)</option>
            <option value="overbought">RSI Overbought (&gt; 70)</option>
          </select>

          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-24 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 font-mono text-slate-200 placeholder-slate-500 focus:outline-none"
          />

          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-24 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 font-mono text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Results Table */}
      <div className="flex-1 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10 overflow-hidden flex flex-col">
        <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between text-xs text-slate-400">
          <span>Found <strong>{results.length}</strong> matching assets</span>
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-auto font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[11px] text-slate-400 bg-black/20">
                <th className="py-2.5 px-4">SYMBOL</th>
                <th className="py-2.5 px-4">PRICE</th>
                <th className="py-2.5 px-4">24H CHANGE</th>
                <th className="py-2.5 px-4">24H HIGH</th>
                <th className="py-2.5 px-4">24H LOW</th>
                <th className="py-2.5 px-4">VOLUME</th>
                <th className="py-2.5 px-4">RSI (14)</th>
                <th className="py-2.5 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {results.map((res) => {
                const isBull = res.changePercent24h >= 0;
                return (
                  <tr key={res.symbol} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-100">{res.symbol}</span>
                        <span className="text-[10px] text-slate-400 font-sans">{res.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-200">{formatPrice(res.price)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 font-bold ${
                          isBull ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isBull ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {formatPercent(res.changePercent24h)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{formatPrice(res.high24h)}</td>
                    <td className="py-3 px-4 text-slate-300">{formatPrice(res.low24h)}</td>
                    <td className="py-3 px-4 text-slate-300">{formatCompactNumber(res.volume24h)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          res.rsi && res.rsi < 30
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : res.rsi && res.rsi > 70
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-white/10 text-slate-300'
                        }`}
                      >
                        {res.rsi?.toFixed(1) || '—'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setActiveSymbol(res.symbol);
                          setActiveView('terminal');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 text-[11px] font-semibold flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <span>Trade</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
