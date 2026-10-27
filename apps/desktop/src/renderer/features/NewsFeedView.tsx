import React from 'react';
import { Newspaper, ExternalLink, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface NewsItem {
  id: string;
  time: string;
  headline: string;
  source: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  relatedSymbols: string[];
}

const MOCK_NEWS: NewsItem[] = [
  {
    id: 'n1',
    time: '12 mins ago',
    headline: 'Bitcoin Holds Firm Above $90,000 as Institutional Spot Inflows Accelerate',
    source: 'Bloomberg Financial',
    sentiment: 'BULLISH',
    relatedSymbols: ['BTC/USD']
  },
  {
    id: 'n2',
    time: '34 mins ago',
    headline: 'NVIDIA Announces Next-Generation Blackwell Ultra Architecture Shipments',
    source: 'Reuters Tech',
    sentiment: 'BULLISH',
    relatedSymbols: ['NVDA', 'QQQ']
  },
  {
    id: 'n3',
    time: '1 hour ago',
    headline: 'Federal Reserve Notes Balance Sheet Normalization On Track Ahead of FOMC',
    source: 'Wall Street Journal',
    sentiment: 'NEUTRAL',
    relatedSymbols: ['SPY', 'EUR/USD']
  },
  {
    id: 'n4',
    time: '2 hours ago',
    headline: 'Tesla Expands Full Self-Driving Robotaxi Rollout to European Testing Hubs',
    source: 'Financial Times',
    sentiment: 'BULLISH',
    relatedSymbols: ['TSLA']
  },
  {
    id: 'n5',
    time: '3 hours ago',
    headline: 'Crude Oil Pressured by Rising Global Inventory Reserves and Dollar Strength',
    source: 'MarketWatch',
    sentiment: 'BEARISH',
    relatedSymbols: ['SPY']
  }
];

export const NewsFeedView: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col p-4 bg-[#070a11] gap-4 overflow-y-auto select-none">
      <div className="flex items-center gap-2.5 p-4 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10">
        <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
          <Newspaper className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-base text-slate-100">Financial News & Market Sentiment</h1>
          <p className="text-xs text-slate-400">Curated real-time market wires, corporate developments & algorithmic sentiment</p>
        </div>
      </div>

      <div className="rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10 overflow-hidden divide-y divide-white/[0.04]">
        {MOCK_NEWS.map((item) => {
          const isBull = item.sentiment === 'BULLISH';
          const isBear = item.sentiment === 'BEARISH';
          const sentimentClass = isBull
            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            : isBear
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
              : 'bg-white/10 text-slate-300 border-white/10';

          return (
            <div key={item.id} className="p-4 flex items-start justify-between hover:bg-white/5 transition-colors gap-4">
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-400">{item.time}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs font-semibold text-slate-300">{item.source}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${sentimentClass}`}>
                    {item.sentiment}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-slate-100 hover:text-sky-400 cursor-pointer transition-colors">
                  {item.headline}
                </h3>

                <div className="flex items-center gap-1.5 mt-1">
                  {item.relatedSymbols.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-sky-400 font-bold"
                    >
                      ${s}
                    </span>
                  ))}
                </div>
              </div>

              <ExternalLink className="w-4 h-4 text-slate-500 hover:text-slate-300 shrink-0 cursor-pointer" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
