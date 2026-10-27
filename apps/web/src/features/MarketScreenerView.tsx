'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Filter, Search, ArrowUpRight, ArrowDownRight, Download, ExternalLink } from 'lucide-react';
import type { ScreenerFilter, ScreenerResult } from '@trd/contracts';
import { screenInstruments } from '@trd/screener';
import { formatCompactNumber, formatPercent, formatPrice } from '@trd/shared-utils';
import { useWebTerminalStore } from '@/stores/useWebTerminalStore';

export const MarketScreenerView: React.FC = () => {
  const router = useRouter();
  const { instruments, latestTicks, setActiveSymbol } = useWebTerminalStore();

  const [assetClass, setAssetClass] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [rsiFilter, setRsiFilter] = useState<'any' | 'oversold' | 'overbought'>('any');

  // Build current screener data from live ticks
  const mockScreenerData: ScreenerResult[] = instruments.map((inst) => {
    const tick = latestTicks[inst.symbol];
    const price = tick?.price || 100;
    const changePct = tick ? (tick.price % 7) - 3.2 : 1.5;
    const change = price * (changePct / 100);

    return {
      symbol: inst.symbol,
      name: inst.name,
      price,
      change24h: Number(change.toFixed(inst.pricePrecision)),
      changePercent24h: Number(changePct.toFixed(2)),
      volume24h: 5000000 + inst.symbol.charCodeAt(0) * 100000,
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

  const handleExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Symbol,Name,Price,Change24h,ChangePct,Volume24h,RSI']
        .concat(
          results.map(
            (r) =>
              `${r.symbol},"${r.name}",${r.price},${r.change24h},${r.changePercent24h}%,${r.volume24h},${r.rsi || ''}`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `trd_screener_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleInspect = (symbol: string) => {
    setActiveSymbol(symbol);
    router.push('/terminal');
  };

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
            <p className="text-xs text-slate-400">
              Scan multi-asset instruments across momentum and technical indicators
            </p>
          </div>
        </div>

        {/* Filter Controls & Export */}
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

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Screener Results Table */}
      <div className="flex-1 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10 overflow-hidden flex flex-col">
        <div className="px-4 py-2.5 bg-black/20 border-b border-white/5 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Matching Assets:{' '}
            <strong className="text-slate-200 font-mono">{results.length}</strong>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Live Simulated Feed</span>
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-auto font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] text-slate-400 bg-black/30">
                <th className="py-2.5 px-4">SYMBOL</th>
                <th className="py-2.5 px-4">NAME</th>
                <th className="py-2.5 px-4 text-right">LAST PRICE</th>
                <th className="py-2.5 px-4 text-right">24H CHANGE</th>
                <th className="py-2.5 px-4 text-right">24H %</th>
                <th className="py-2.5 px-4 text-right">24H VOL</th>
                <th className="py-2.5 px-4 text-right">RSI (14)</th>
                <th className="py-2.5 px-4 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No instruments matching current screen criteria.
                  </td>
                </tr>
              ) : (
                results.map((item) => {
                  const isUp = item.change24h >= 0;
                  const inst = instruments.find((i) => i.symbol === item.symbol);
                  return (
                    <tr
                      key={item.symbol}
                      onClick={() => handleInspect(item.symbol)}
                      className="hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                      <td className="py-2.5 px-4 font-bold text-slate-100 flex items-center gap-1.5">
                        <span>{item.symbol}</span>
                        <span className="text-[9px] uppercase px-1 rounded bg-white/5 text-slate-400 font-normal">
                          {inst?.assetClass}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-400 font-sans">{item.name}</td>
                      <td className="py-2.5 px-4 text-right font-semibold text-slate-100">
                        {formatPrice(item.price, inst?.pricePrecision || 2)}
                      </td>
                      <td
                        className={`py-2.5 px-4 text-right font-semibold ${
                          isUp ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isUp ? '+' : ''}
                        {formatPrice(item.change24h, inst?.pricePrecision || 2)}
                      </td>
                      <td
                        className={`py-2.5 px-4 text-right font-semibold ${
                          isUp ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {formatPercent(item.changePercent24h)}
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-300">
                        {formatCompactNumber(item.volume24h)}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                            item.rsi && item.rsi > 70
                              ? 'bg-rose-500/20 text-rose-400'
                              : item.rsi && item.rsi < 30
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'text-slate-300'
                          }`}
                        >
                          {item.rsi || '—'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="opacity-0 group-hover:opacity-100 px-2 py-1 rounded bg-sky-500/20 text-sky-400 text-[10px] font-semibold transition-opacity inline-flex items-center gap-1">
                          Trade <ExternalLink className="w-3 h-3" />
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

