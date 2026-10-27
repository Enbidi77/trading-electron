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
    notes: 'Waited for the 15m candle close above resistance before pulling trigger. Took 50% off at 2R.'
  },
  {
    id: 'j2',
    date: 'Yesterday, 02:40 PM',
    symbol: 'NVDA',
    setup: 'VWAP Bounce',
    side: 'LONG',
    pnl: 320,
    emotion: 'Disciplined',
    notes: 'Clean bounce off the daily VWAP with high relative volume. Trailed stop loss properly.'
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
  const [newPnL, setNewPnL] = useState('200');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotes) return;

    const entry: JournalEntry = {
      id: `j_${Date.now()}`,
      date: 'Just now',
      symbol: newSymbol,
      setup: newSetup,
      side: Number(newPnL) >= 0 ? 'LONG' : 'SHORT',
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
          <h1 className="font-bold text-base text-slate-100">Trading Journal & Review Log</h1>
          <p className="text-xs text-slate-400">Record trade psychology, setup playbooks & emotional discipline</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Form */}
        <form
          onSubmit={handleAdd}
          className="p-4 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10 flex flex-col gap-3"
        >
          <h2 className="text-sm font-bold text-slate-200">Log New Trade Lesson</h2>

          <div>
            <label className="text-xs text-slate-400">Symbol</label>
            <input
              type="text"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
              className="mt-1 w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 font-mono text-sm text-slate-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400">Playbook Setup</label>
            <input
              type="text"
              value={newSetup}
              onChange={(e) => setNewSetup(e.target.value)}
              className="mt-1 w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400">P&L ($)</label>
            <input
              type="number"
              value={newPnL}
              onChange={(e) => setNewPnL(e.target.value)}
              className="mt-1 w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 font-mono text-sm text-slate-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400">Analysis & Notes</label>
            <textarea
              rows={3}
              placeholder="What went well? Did you stick to risk limits?"
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="mt-1 w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-100 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Entry</span>
          </button>
        </form>

        {/* Entries list */}
        <div className="md:col-span-2 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10 overflow-hidden flex flex-col divide-y divide-white/[0.04]">
          {entries.map((item) => {
            const isProfit = item.pnl >= 0;
            return (
              <div key={item.id} className="p-4 flex flex-col gap-2 hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-100">{item.symbol}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                      {item.setup}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/15 text-sky-400">
                      {item.emotion}
                    </span>
                  </div>

                  <span
                    className={`font-mono font-bold text-sm ${
                      isProfit ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isProfit ? '+' : ''}
                    {formatCurrency(item.pnl)}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{item.notes}</p>
                <span className="text-[10px] text-slate-500 font-mono">{item.date}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
