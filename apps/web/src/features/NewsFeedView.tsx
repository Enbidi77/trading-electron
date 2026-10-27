'use client';

import React from 'react';
import { Newspaper, ExternalLink, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';
import { useWebTerminalStore } from '@/stores/useWebTerminalStore';
import { useRouter } from 'next/navigation';

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
    headline: 'Bitcoin Holds Firm Above $90,000 as Institutional Spot ETF Inflows Accelerate',
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
    relatedSymbols: ['NVDA', 'SPY']
  },
  {
    id: 'n3',
    time: '1 hour ago',
    headline: 'Federal Reserve Notes Balance Sheet Normalization On Track Ahead of FOMC Session',
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
  },
  {
    id: 'n6',
    time: '4 hours ago',
    headline: 'Ethereum Layer-2 Network Activity Surpasses 150 Million Daily Transactions',
    source: 'CoinDesk',
    sentiment: 'BULLISH',
    relatedSymbols: ['ETH/USD']
  }
];

export const NewsFeedView: React.FC = () => {
  const router = useRouter();
  const { setActiveSymbol } = useWebTerminalStore();

  const handleSelectSymbol = (sym: string) => {
    setActiveSymbol(sym);
    router.push('/terminal');
  };

  return (
    <div className="w-full h-full flex flex-col p-4 bg-[#070a11] gap-4 overflow-y-auto select-none">
      <div className="flex items-center gap-2.5 p-4 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10">
        <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
          <Newspaper className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-base text-slate-100">Live Financial News Wire</h1>
          <p className="text-xs text-slate-400">
            Real-time macroeconomic headlines with sentiment classification & symbol tagging
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {MOCK_NEWS.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          >
            <div className="flex flex-col gap-1.5 max-w-3xl">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium">{item.source}</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-500 font-mono text-[11px]">{item.time}</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    item.sentiment === 'BULLISH'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : item.sentiment === 'BEARISH'
                      ? 'bg-rose-500/15 text-rose-400'
                      : 'bg-slate-500/15 text-slate-400'
                  }`}
                >
                  {item.sentiment}
                </span>
              </div>
              <h2 className="text-sm font-semibold text-slate-100 hover:text-sky-400 transition-colors">
                {item.headline}
              </h2>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {item.relatedSymbols.map((sym) => (
                <button
                  key={sym}
                  onClick={() => handleSelectSymbol(sym)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-semibold text-sky-400 hover:text-white transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>{sym}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

