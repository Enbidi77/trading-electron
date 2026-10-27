'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Activity,
  Clock,
  LayoutGrid,
  Sliders,
  Sun,
  ShieldAlert,
  ArrowRight,
  Filter,
  PieChart,
  Repeat
} from 'lucide-react';
import { useWebTerminalStore } from '@/stores/useWebTerminalStore';

export const WebCommandPalette: React.FC = () => {
  const router = useRouter();
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    instruments,
    setActiveSymbol,
    setActiveTimeframe,
    setChartLayout,
    setActiveView,
    toggleTheme,
    setRiskModalOpen
  } = useWebTerminalStore();

  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      } else if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const filteredInstruments = instruments.filter(
    (i) =>
      i.symbol.toLowerCase().includes(query.toLowerCase()) ||
      i.name.toLowerCase().includes(query.toLowerCase())
  );

  const navigateTo = (path: string, viewId: any) => {
    setActiveView(viewId);
    setCommandPaletteOpen(false);
    router.push(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/60 backdrop-blur-md p-4 select-none">
      <div className="w-full max-w-xl bg-[#0d131f]/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3 border-b border-white/10">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            autoFocus
            type="text"
            placeholder="Search symbol (BTC, AAPL, EUR/USD) or navigate (screener, portfolio)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-mono"
          />
          <kbd className="text-[10px] font-mono text-slate-500 px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 flex flex-col gap-1 text-xs">
          {/* Quick Actions */}
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-2 py-1">
            Terminal Actions
          </div>

          <button
            onClick={() => {
              setRiskModalOpen(true);
              setCommandPaletteOpen(false);
            }}
            className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 text-slate-200 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-sky-400" />
              <span>Open Risk & Position Sizing Calculator</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          </button>

          <button
            onClick={() => {
              toggleTheme();
              setCommandPaletteOpen(false);
            }}
            className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 text-slate-200 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Toggle Dark / Light Glass Theme</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          </button>

          <button
            onClick={() => navigateTo('/screener', 'screener')}
            className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 text-slate-200 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-400" />
              <span>Go to Market Screener</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          </button>

          <button
            onClick={() => navigateTo('/portfolio', 'portfolio')}
            className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 text-slate-200 transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-400" />
              <span>Go to Portfolio Analytics</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {/* Instruments */}
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-2 py-1 mt-2">
            Instruments ({filteredInstruments.length})
          </div>

          {filteredInstruments.map((inst) => (
            <button
              key={inst.symbol}
              onClick={() => {
                setActiveSymbol(inst.symbol);
                setCommandPaletteOpen(false);
                router.push('/terminal');
              }}
              className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/10 text-slate-200 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-400" />
                <span className="font-mono font-semibold">{inst.symbol}</span>
                <span className="text-[11px] text-slate-400">{inst.name}</span>
              </div>
              <span className="text-[10px] text-slate-500 uppercase">{inst.assetClass}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

