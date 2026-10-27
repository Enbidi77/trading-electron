import React, { useState } from 'react';
import { Calendar, Globe, AlertCircle } from 'lucide-react';

interface CalendarEvent {
  id: string;
  time: string;
  currency: string;
  country: string;
  event: string;
  impact: 'HIGH' | 'MED' | 'LOW';
  actual?: string;
  forecast: string;
  previous: string;
}

const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: 'e1',
    time: '14:30 EST',
    currency: 'USD',
    country: 'United States',
    event: 'Core CPI (MoM) (Jan)',
    impact: 'HIGH',
    actual: '0.3%',
    forecast: '0.3%',
    previous: '0.2%'
  },
  {
    id: 'e2',
    time: '14:30 EST',
    currency: 'USD',
    country: 'United States',
    event: 'CPI (YoY) (Jan)',
    impact: 'HIGH',
    actual: '3.0%',
    forecast: '2.9%',
    previous: '3.4%'
  },
  {
    id: 'e3',
    time: '16:00 EST',
    currency: 'USD',
    country: 'United States',
    event: 'FOMC Member Speech',
    impact: 'MED',
    forecast: '—',
    previous: '—'
  },
  {
    id: 'e4',
    time: '08:00 GMT',
    currency: 'EUR',
    country: 'Eurozone',
    event: 'German Manufacturing PMI',
    impact: 'MED',
    actual: '45.8',
    forecast: '45.5',
    previous: '45.0'
  },
  {
    id: 'e5',
    time: '23:50 JST',
    currency: 'JPY',
    country: 'Japan',
    event: 'GDP (QoQ) (Q4)',
    impact: 'HIGH',
    actual: '0.1%',
    forecast: '0.2%',
    previous: '-0.7%'
  }
];

export const EconomicCalendarView: React.FC = () => {
  const [filterImpact, setFilterImpact] = useState<string>('ALL');

  const filtered = MOCK_EVENTS.filter((e) =>
    filterImpact === 'ALL' ? true : e.impact === filterImpact
  );

  return (
    <div className="w-full h-full flex flex-col p-4 bg-[#070a11] gap-4 overflow-y-auto select-none">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base text-slate-100">Global Economic Calendar</h1>
            <p className="text-xs text-slate-400">Scheduled macroeconomic releases, central bank decisions & metrics</p>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1 bg-black/20 p-1 rounded-lg border border-white/5 text-xs">
          {['ALL', 'HIGH', 'MED', 'LOW'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterImpact(lvl)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all cursor-pointer ${
                filterImpact === lvl
                  ? 'bg-sky-500/25 text-sky-400 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Events Table */}
      <div className="rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10 overflow-hidden">
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead>
            <tr className="border-b border-white/5 text-[10px] text-slate-400 bg-black/20">
              <th className="py-2.5 px-4">TIME</th>
              <th className="py-2.5 px-4">CURRENCY</th>
              <th className="py-2.5 px-4">IMPACT</th>
              <th className="py-2.5 px-4">EVENT</th>
              <th className="py-2.5 px-4">ACTUAL</th>
              <th className="py-2.5 px-4">FORECAST</th>
              <th className="py-2.5 px-4">PREVIOUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filtered.map((ev) => {
              const impactClass =
                ev.impact === 'HIGH'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : ev.impact === 'MED'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-white/10 text-slate-300';

              return (
                <tr key={ev.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-slate-400">{ev.time}</td>
                  <td className="py-3 px-4 font-bold text-slate-200">{ev.currency}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${impactClass}`}>
                      {ev.impact}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-100 font-sans font-medium">{ev.event}</td>
                  <td className="py-3 px-4 font-bold text-emerald-400">{ev.actual || '—'}</td>
                  <td className="py-3 px-4 text-slate-400">{ev.forecast}</td>
                  <td className="py-3 px-4 text-slate-400">{ev.previous}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
