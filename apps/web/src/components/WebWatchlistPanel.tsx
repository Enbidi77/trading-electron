'use client';

import React, { useState } from 'react';
import { Search, Plus, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatPercent, formatPrice } from '@trd/shared-utils';
import { PriceTag } from '@trd/ui';
import { useWebTerminalStore } from '@/stores/useWebTerminalStore';

export const WebWatchlistPanel: React.FC = () => {
  const {
    instruments,
    activeSymbol,
    setActiveSymbol,
    latestTicks,
    watchlists,
    activeWatchlistId,
    removeFromWatchlist,
    addToWatchlist
  } = useWebTerminalStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [addMode, setAddMode] = useState(false);

  const activeWatchlist = watchlists.find((w) => w.id === activeWatchlistId) || watchlists[0];
  const watchlistSymbols = activeWatchlist?.symbols || [];

  const displayedInstruments = instruments.filter((inst) => {
    const inWatchlist = addMode
      ? !watchlistSymbols.includes(inst.symbol)
      : watchlistSymbols.includes(inst.symbol);
    if (!inWatchlist) return false;

    if (filterClass !== 'all' && inst.assetClass !== filterClass) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return inst.symbol.toLowerCase().includes(q) || inst.name.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="w-full h-full flex flex-col bg-[#090d16]/85 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden select-none">
      {/* Top Header */}
      <div className="h-8 flex items-center justify-between px-3 bg-white/5 border-b border-white/5 text-xs">
        <span className="font-semibold text-slate-200">{activeWatchlist?.name || 'Watchlist'}</span>
        <button
          onClick={() => setAddMode(!addMode)}
          className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer ${
            addMode ? 'bg-sky-500 text-white' : 'bg-white/5 hover:bg-white/10 text-slate-300'
          }`}
        >
          <Plus className="w-3 h-3" />
          <span>{addMode ? 'Done' : 'Add Symbol'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-2 border-b border-white/5 flex flex-col gap-1.5 bg-black/10">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder={addMode ? 'Search symbol to add...' : 'Filter symbols...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
          />
        </div>

        {/* Asset Class Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto text-[10px]">
          {['all', 'crypto', 'equity', 'forex'].map((c) => (
            <button
              key={c}
              onClick={() => setFilterClass(c)}
              className={`px-2 py-0.5 rounded uppercase font-mono tracking-wider transition-all cursor-pointer ${
                filterClass === c
                  ? 'bg-sky-500/20 text-sky-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Symbol List */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
        {displayedInstruments.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500">
            {addMode ? 'No additional symbols available' : 'No symbols found in watchlist'}
          </div>
        ) : (
          displayedInstruments.map((inst) => {
            const isSelected = inst.symbol === activeSymbol;
            const tick = latestTicks[inst.symbol];
            const price = tick?.price || 100;
            const changePct = tick ? (tick.price % 7) - 3.2 : 1.2;

            return (
              <div
                key={inst.symbol}
                onClick={() => !addMode && setActiveSymbol(inst.symbol)}
                className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-colors ${
                  isSelected ? 'bg-sky-500/15 border-l-2 border-sky-400' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-semibold text-xs text-slate-100">
                      {inst.symbol}
                    </span>
                    <span className="text-[9px] uppercase px-1 rounded bg-white/5 text-slate-400">
                      {inst.assetClass}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                    {inst.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-end font-mono">
                    <span className="text-xs font-semibold text-slate-100">
                      {formatPrice(price, inst.pricePrecision)}
                    </span>
                    <span
                      className={`text-[10px] flex items-center ${
                        changePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {changePct >= 0 ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      {formatPercent(changePct)}
                    </span>
                  </div>

                  {addMode ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToWatchlist(inst.symbol);
                      }}
                      className="p-1 rounded bg-sky-500/20 hover:bg-sky-500/30 text-sky-400"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWatchlist(inst.symbol);
                      }}
                      title="Remove from watchlist"
                      className="opacity-0 hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

