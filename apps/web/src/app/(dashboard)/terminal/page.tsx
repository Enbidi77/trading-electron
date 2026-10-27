'use client';

import React, { useState } from 'react';
import { WebChartWorkspace } from '@/components/WebChartWorkspace';
import { WebPositionsAndOrders } from '@/components/WebPositionsAndOrders';
import { WebOrderBookDOM } from '@/components/WebOrderBookDOM';
import { WebTimeAndSales } from '@/components/WebTimeAndSales';
import { WebWatchlistPanel } from '@/components/WebWatchlistPanel';
import { WebOrderTicket } from '@/components/WebOrderTicket';

export default function TerminalPage() {
  const [rightPanelTab, setRightPanelTab] = useState<'dom' | 'watchlist' | 'ticket'>('dom');

  return (
    <div className="flex-1 flex flex-col lg:flex-row p-1.5 gap-1.5 overflow-hidden w-full h-full">
      {/* Left/Center Workspace: Chart (top ~68%) & Positions/Orders (bottom ~32%) */}
      <div className="flex-1 flex flex-col gap-1.5 overflow-hidden">
        <div className="flex-1 h-[68%] min-h-[300px]">
          <WebChartWorkspace />
        </div>
        <div className="h-[32%] min-h-[180px]">
          <WebPositionsAndOrders />
        </div>
      </div>

      {/* Right Sidebar: Tabs for DOM, Watchlist, or Order Ticket */}
      <div className="w-full lg:w-80 xl:w-96 flex flex-col gap-1.5 overflow-hidden">
        {/* Panel Tab Switcher */}
        <div className="h-8 flex items-center justify-between px-2 bg-[#090d16]/85 backdrop-blur-xl border border-white/10 rounded-xl text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setRightPanelTab('dom')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                rightPanelTab === 'dom'
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              DOM / Tape
            </button>
            <button
              onClick={() => setRightPanelTab('watchlist')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                rightPanelTab === 'watchlist'
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Watchlist
            </button>
            <button
              onClick={() => setRightPanelTab('ticket')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                rightPanelTab === 'ticket'
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Trade Ticket
            </button>
          </div>
        </div>

        {/* Right Tab Content */}
        <div className="flex-1 flex flex-col gap-1.5 overflow-hidden">
          {rightPanelTab === 'dom' && (
            <>
              <div className="flex-1 min-h-[260px]">
                <WebOrderBookDOM />
              </div>
              <div className="h-52">
                <WebTimeAndSales />
              </div>
            </>
          )}

          {rightPanelTab === 'watchlist' && (
            <div className="flex-1 h-full">
              <WebWatchlistPanel />
            </div>
          )}

          {rightPanelTab === 'ticket' && (
            <div className="flex-1 h-full">
              <WebOrderTicket />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

