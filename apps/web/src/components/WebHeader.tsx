'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  ChevronDown,
  LayoutGrid,
  LogOut,
  Moon,
  Search,
  ShieldAlert,
  Sun,
  User,
  Wallet
} from 'lucide-react';
import { useWebTerminalStore } from '@/stores/useWebTerminalStore';
import { TIMEFRAMES } from '@trd/configuration';
import { formatCurrency, formatPercent, formatPrice } from '@trd/shared-utils';
import { api } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

export const WebHeader: React.FC = () => {
  const router = useRouter();
  const {
    activeSymbol,
    instruments,
    activeTimeframe,
    chartLayout,
    settings,
    balance,
    latestTicks,
    providerStatus,
    setActiveSymbol,
    setActiveTimeframe,
    setChartLayout,
    toggleTheme,
    setCommandPaletteOpen,
    setRiskModalOpen
  } = useWebTerminalStore();

  const [symbolDropdownOpen, setSymbolDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const currentTick = latestTicks[activeSymbol];
  const currentPrice = currentTick?.price || 100;
  const currentInst = instruments.find((i) => i.symbol === activeSymbol);

  const change24hPct = currentTick ? (currentTick.price % 7) - 3.2 : 1.45;
  const high24h = currentPrice * 1.025;
  const low24h = currentPrice * 0.978;

  const handleLogout = async () => {
    try {
      await api.logout();
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };

  return (
    <header className="h-12 w-full flex items-center justify-between px-3 bg-[#0d131f]/85 dark:bg-[#070a11]/90 backdrop-blur-xl border-b border-white/10 select-none z-30">
      {/* Left: Branding & Symbol Picker */}
      <div className="flex items-center gap-3">
        {/* App Title / Logo */}
        <Link href="/" className="flex items-center gap-2 pr-2 border-r border-white/10 hover:opacity-90 transition-opacity">
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-sky-500 via-indigo-500 to-emerald-400 p-[1px] shadow-sm shadow-sky-500/20">
            <div className="w-full h-full bg-[#070a11] rounded-[5px] flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-sky-400" />
            </div>
          </div>
          <span className="font-bold text-xs tracking-wider text-slate-100 flex items-center gap-1.5">
            TRD <span className="text-sky-400 font-semibold text-[10px] px-1 py-0.2 rounded bg-sky-500/10 border border-sky-500/20">WEB</span>
          </span>
        </Link>

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
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-left transition-colors cursor-pointer text-xs"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-200">{inst.symbol}</span>
                        <span className="text-[10px] text-slate-400">{inst.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-slate-200">
                          {tick ? formatPrice(tick.price, inst.pricePrecision) : '—'}
                        </div>
                        <div className="text-[9px] text-slate-500 uppercase">{inst.assetClass}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Price & 24h Ticker Summary */}
        <div className="hidden md:flex items-center gap-3 pl-2 border-l border-white/10 text-xs">
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono font-bold text-sm text-slate-100">
              {formatPrice(currentPrice, currentInst?.pricePrecision || 2)}
            </span>
            <span
              className={`font-mono text-[11px] font-medium ${
                change24hPct >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatPercent(change24hPct)}
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-400">
            <div>
              <span className="text-slate-500">24h H: </span>
              <span className="font-mono text-slate-300">
                {formatPrice(high24h, currentInst?.pricePrecision || 2)}
              </span>
            </div>
            <div>
              <span className="text-slate-500">24h L: </span>
              <span className="font-mono text-slate-300">
                {formatPrice(low24h, currentInst?.pricePrecision || 2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Timeframe & Multichart Layout Switchers */}
      <div className="hidden xl:flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/5">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf.value}
            onClick={() => setActiveTimeframe(tf.value)}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
              activeTimeframe === tf.value
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tf.label}
          </button>
        ))}

        <div className="w-[1px] h-3 bg-white/10 mx-1" />

        {/* Layout Selectors */}
        {(['1x1', '1x2', '2x1', '2x2'] as const).map((l) => (
          <button
            key={l}
            onClick={() => setChartLayout(l)}
            title={`Layout ${l}`}
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-all cursor-pointer ${
              chartLayout === l
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Right Controls: Status, Account, Modals, Theme, User Menu */}
      <div className="flex items-center gap-2">
        {/* Market Status Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{providerStatus === 'CONNECTED' ? 'LIVE FEED' : 'CONNECTING'}</span>
        </div>

        {/* Command Palette Trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 transition-all cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline text-[11px] text-slate-400">Search</span>
          <kbd className="hidden md:inline text-[9px] px-1.5 py-0.2 rounded bg-black/40 border border-white/10 font-mono text-slate-400">
            Ctrl+K
          </kbd>
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

        {/* User Profile & Sign Out Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-slate-950">
              P
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#0d131f]/95 backdrop-blur-2xl border border-white/15 rounded-xl shadow-2xl p-1.5 z-50 text-xs">
              <div className="px-3 py-2 border-b border-white/10">
                <div className="font-semibold text-slate-100">Pro Trader</div>
                <div className="text-[10px] text-slate-400 font-mono">demo@trdpro.io</div>
              </div>
              <Link
                href="/settings"
                onClick={() => setUserMenuOpen(false)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-slate-300 transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
