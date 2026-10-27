import React, { useState } from 'react';
import {
  Activity,
  ChevronDown,
  LayoutGrid,
  Moon,
  Search,
  ShieldAlert,
  Sun,
  Wallet,
  Minus,
  Square,
  X
} from 'lucide-react';
import { useTerminalStore } from '../stores/useTerminalStore.js';
import { TIMEFRAMES } from '@trd/configuration';
import { formatCurrency, formatPercent, formatPrice } from '@trd/shared-utils';
import { PriceTag } from '@trd/ui';

export const Header: React.FC = () => {
  const {
    activeSymbol,
    instruments,
    activeTimeframe,
    chartLayout,
    settings,
    balance,
    latestTicks,
    setActiveSymbol,
    setActiveTimeframe,
    setChartLayout,
    toggleTheme,
    setCommandPaletteOpen,
    setRiskModalOpen
  } = useTerminalStore();

  const [symbolDropdownOpen, setSymbolDropdownOpen] = useState(false);
  const currentTick = latestTicks[activeSymbol];
  const currentPrice = currentTick?.price || 100;
  const currentInst = instruments.find((i) => i.symbol === activeSymbol);

  // Simulated 24h metrics based on base
  const change24hPct = currentTick ? ((currentTick.price % 7) - 3.2) : 1.45;
  const high24h = currentPrice * 1.025;
  const low24h = currentPrice * 0.978;

  const handleWindowMinimize = () => {
    (window as any).electronAPI?.invoke('window:minimize');
  };

  const handleWindowMaximize = () => {
    (window as any).electronAPI?.invoke('window:maximize');
  };

  const handleWindowClose = () => {
    (window as any).electronAPI?.invoke('window:close');
  };

  return (
    <header className="h-12 w-full flex items-center justify-between px-3 bg-[#0d131f]/80 dark:bg-[#090d16]/80 backdrop-blur-xl border-b border-white/10 select-none z-30">
      {/* Left: Branding & Symbol Picker */}
      <div className="flex items-center gap-3">
        {/* App Title / Logo */}
        <div className="flex items-center gap-2 pr-2 border-r border-white/10">
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-sky-500 via-indigo-500 to-emerald-400 p-[1px] shadow-sm shadow-sky-500/20">
            <div className="w-full h-full bg-[#070a11] rounded-[5px] flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-sky-400" />
            </div>
          </div>
          <span className="font-bold text-xs tracking-wider text-slate-100 flex items-center gap-1.5">
            TRD <span className="text-sky-400 font-semibold text-[10px] px-1 py-0.2 rounded bg-sky-500/10 border border-sky-500/20">PRO</span>
          </span>
        </div>

        {/* Symbol Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setSymbolDropdownOpen(!symbolDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-100 transition-all cursor-pointer"
          >
            <span className="font-mono">{activeSymbol}</span>
            <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">
              {currentInst?.name}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {symbolDropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-64 bg-[#0d131f]/95 backdrop-blur-2xl border border-white/15 rounded-xl shadow-2xl p-1.5 z-50">
              <div className="text-[11px] font-medium text-slate-400 px-2 py-1">Select Instrument</div>
              <div className="max-h-60 overflow-y-auto flex flex-col gap-0.5">
                {instruments.map((inst) => {
                  const tick = latestTicks[inst.symbol];
                  return (
                    <button
                      key={inst.symbol}
                      onClick={() => {
                        setActiveSymbol(inst.symbol);
                        setSymbolDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        inst.symbol === activeSymbol
                          ? 'bg-sky-500/20 text-sky-400 font-medium'
                          : 'hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      <div className="flex flex-col text-left">
                        <span className="font-mono font-semibold">{inst.symbol}</span>
                        <span className="text-[10px] text-slate-500">{inst.name}</span>
                      </div>
                      <span className="font-mono text-slate-200">
                        {tick ? formatPrice(tick.price, inst.pricePrecision) : '—'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Live Ticker Stats Pill */}
        <div className="hidden lg:flex items-center gap-3 px-3 py-1 rounded-lg bg-black/20 border border-white/5 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[10px]">LAST:</span>
            <PriceTag price={currentPrice} precision={currentInst?.pricePrecision || 2} />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-slate-400 text-[10px]">24H:</span>
            <span className={change24hPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {formatPercent(change24hPct)}
            </span>
          </div>
          <div className="hidden xl:flex items-center gap-1">
            <span className="text-slate-400 text-[10px]">HIGH:</span>
            <span className="text-slate-300">{formatPrice(high24h, currentInst?.pricePrecision || 2)}</span>
          </div>
          <div className="hidden xl:flex items-center gap-1">
            <span className="text-slate-400 text-[10px]">LOW:</span>
            <span className="text-slate-300">{formatPrice(low24h, currentInst?.pricePrecision || 2)}</span>
          </div>
        </div>
      </div>

      {/* Center: Timeframe Pills & Layout Selector */}
      <div className="flex items-center gap-1.5">
        {/* Timeframes */}
        <div className="flex items-center p-0.5 rounded-lg bg-black/20 border border-white/5">
          {TIMEFRAMES.slice(0, 6).map((tf) => (
            <button
              key={tf.value}
              onClick={() => setActiveTimeframe(tf.value)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all cursor-pointer ${
                activeTimeframe === tf.value
                  ? 'bg-sky-500/25 text-sky-400 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Multi-chart Layout Selector */}
        <div className="flex items-center p-0.5 rounded-lg bg-black/20 border border-white/5">
          {(['1x1', '1x2', '2x1', '2x2'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setChartLayout(l)}
              title={`Layout ${l}`}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-all cursor-pointer ${
                chartLayout === l
                  ? 'bg-white/15 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Right: Quick Search, Balance, Risk, Theme & Window Controls */}
      <div className="flex items-center gap-2">
        {/* Global Search Button */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 transition-all cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline text-[11px]">Search</span>
          <kbd className="text-[10px] font-mono text-slate-500 px-1 rounded bg-black/30">⌘K</kbd>
        </button>

        {/* Risk Calculator Trigger */}
        <button
          onClick={() => setRiskModalOpen(true)}
          title="Risk & Position Sizing Calculator"
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-sky-400 transition-all cursor-pointer"
        >
          <ShieldAlert className="w-4 h-4" />
        </button>

        {/* Paper Account Balance Pill */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs">
          <Wallet className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-mono text-slate-200 font-medium">
            {formatCurrency(balance.equity)}
          </span>
          <span
            className={`font-mono text-[10px] px-1 rounded ${
              balance.dailyPnL >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}
          >
            {formatPercent(balance.dailyPnLPercent)}
          </span>
        </div>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          title="Toggle Theme"
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-all cursor-pointer"
        >
          {settings.theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-sky-400" />
          )}
        </button>

        {/* Desktop Window Controls */}
        <div className="hidden sm:flex items-center gap-1 pl-1 border-l border-white/10">
          <button
            onClick={handleWindowMinimize}
            className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleWindowMaximize}
            className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={handleWindowClose}
            className="p-1 hover:bg-rose-500/80 rounded text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
