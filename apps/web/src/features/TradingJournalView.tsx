'use client';

import React, { useState } from 'react';
import { BookOpen, Plus, Tag, Smile, Frown, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@trd/shared-utils';

interface JournalEntry {
  id: string;
  date: string;
  symbol: string;
  setup: string;
  side: 'LONG' | 'SHORT';
  pnl: number;
  emotion: 'Disciplined' | 'FOMO' | 'Hesitant';
  notes: string;
}

const INITIAL_ENTRIES: JournalEntry[] = [
  {
    id: 'j1',
    date: 'Today, 10:15 AM',
    symbol: 'BTC/USD',
    setup: 'Bull Flag Breakout',
    side: 'LONG',
    pnl: 450,
    emotion: 'Disciplined',
    notes: 'Waited for the 15m candle close above resistance before pulling trigger. Scaled 50% at 2R.'
  },
  {
    id: 'j2',
    date: 'Yesterday, 02:40 PM',
    symbol: 'NVDA',
    setup: 'VWAP Bounce',
    side: 'LONG',
    pnl: 320,
    emotion: 'Disciplined',
    notes: 'Clean bounce off the daily VWAP with high relative volume. Trailed stop loss cleanly.'
  },
  {
    id: 'j3',
    date: 'Oct 25, 11:00 AM',
    symbol: 'TSLA',
    setup: 'Reversal Fade',
    side: 'SHORT',
    pnl: -180,
    emotion: 'Hesitant',
    notes: 'Entered slightly early before confirmation. Cut loss immediately at predefined stop.'
  }
];

export const TradingJournalView: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>(INITIAL_ENTRIES);
  const [newSymbol, setNewSymbol] = useState('BTC/USD');
  const [newSetup, setNewSetup] = useState('Breakout');
  const [newNotes, setNewNotes] = useState('');
  const [newPnL, setNewPnL] = useState('250');
  const [newSide, setNewSide] = useState<'LONG' | 'SHORT'>('LONG');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotes) return;

    const entry: JournalEntry = {
      id: `j_${Date.now()}`,
      date: 'Just now',
      symbol: newSymbol,
      setup: newSetup,
      side: newSide,
      pnl: Number(newPnL),
      emotion: 'Disciplined',
      notes: newNotes
    };

    setEntries([entry, ...entries]);
    setNewNotes('');
  };

  return (
    <div className="w-full h-full flex flex-col p-4 bg-[#070a11] gap-4 overflow-y-auto select-none">
      <div className="flex items-center gap-2.5 p-4 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10">
        <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-base text-slate-100">Trader Psychology & Execution Journal</h1>
          <p className="text-xs text-slate-400">
            Log execution psychology, rule adherence, mistakes, and strategy review
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* New Entry Form */}
        <form
          onSubmit={handleAdd}
          className="p-4 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10 flex flex-col gap-3"
        >
          <h2 className="text-sm font-bold text-slate-200">Log Trade Review</h2>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-400">Symbol</label>
              <input
                type="text"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
                className="mt-1 w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 font-mono text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">P&L ($)</label>
              <input
                type="number"
                value={newPnL}
                onChange={(e) => setNewPnL(e.target.value)}
                className="mt-1 w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 font-mono text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-400">Side</label>
              <select
                value={newSide}
                onChange={(e) => setNewSide(e.target.value as any)}
                className="mt-1 w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none"
              >
                <option value="LONG">LONG</option>
                <option value="SHORT">SHORT</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400">Setup Pattern</label>
              <input
                type="text"
                value={newSetup}
                onChange={(e) => setNewSetup(e.target.value)}
                className="mt-1 w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400">Execution Notes & Review</label>
            <textarea
              rows={3}
              required
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="What worked? Did you follow your risk rules?"
              className="mt-1 w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
          >
            Add Journal Entry
          </button>
        </form>

        {/* Entries List */}
        <div className="md:col-span-2 p-5 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-slate-200">Historical Journal Entries ({entries.length})</h2>
          <div className="divide-y divide-white/[0.04] max-h-96 overflow-y-auto flex flex-col gap-2">
            {entries.map((entry) => (
              <div key={entry.id} className="pt-3 pb-2 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-white">{entry.symbol}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                        entry.side === 'LONG' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {entry.side}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/5 text-slate-400">
                      {entry.setup}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-xs font-bold ${
                        entry.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {formatCurrency(entry.pnl)}
                    </span>
                    <span className="text-[10px] text-slate-500">{entry.date}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{entry.notes}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

