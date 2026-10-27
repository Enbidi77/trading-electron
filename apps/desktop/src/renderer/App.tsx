import React, { useEffect, useState } from 'react';
import { useTerminalStore } from './stores/useTerminalStore.js';
import { Header } from './components/Header.js';
import { SidebarDock } from './components/SidebarDock.js';
import { ChartWorkspace } from './components/ChartWorkspace.js';
import { OrderBookDOM } from './components/OrderBookDOM.js';
import { TimeAndSales } from './components/TimeAndSales.js';
import { WatchlistPanel } from './components/WatchlistPanel.js';
import { OrderTicket } from './components/OrderTicket.js';
import { PositionsAndOrders } from './components/PositionsAndOrders.js';
import { CommandPalette } from './components/CommandPalette.js';
import { RiskCalculatorModal } from './components/RiskCalculatorModal.js';

// Feature Views
import { MarketScreenerView } from './features/MarketScreenerView.js';
import { PortfolioAnalyticsView } from './features/PortfolioAnalyticsView.js';
import { BacktesterView } from './features/BacktesterView.js';
import { AlertsManagerView } from './features/AlertsManagerView.js';
import { EconomicCalendarView } from './features/EconomicCalendarView.js';
import { NewsFeedView } from './features/NewsFeedView.js';
import { TradingJournalView } from './features/TradingJournalView.js';
import { SettingsView } from './features/SettingsView.js';

export const App: React.FC = () => {
  const { init, activeView } = useTerminalStore();
  const [rightPanelTab, setRightPanelTab] = useState<'dom' | 'watchlist' | 'ticket'>('dom');

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="w-screen h-screen flex flex-col bg-[#070a11] text-slate-100 overflow-hidden font-sans">
      {/* Top Liquid Glass Header */}
      <Header />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Vertical Dock */}
        <SidebarDock />

        {/* Dynamic Center Area based on activeView */}
        <main className="flex-1 flex overflow-hidden">
          {activeView === 'terminal' && (
            <div className="flex-1 flex flex-col lg:flex-row p-1.5 gap-1.5 overflow-hidden">
              {/* Left/Center Workspace: Chart (top 70%) & Positions/Orders (bottom 30%) */}
              <div className="flex-1 flex flex-col gap-1.5 overflow-hidden">
                <div className="flex-1 h-[68%] min-h-[300px]">
                  <ChartWorkspace />
                </div>
                <div className="h-[32%] min-h-[180px]">
                  <PositionsAndOrders />
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
                        <OrderBookDOM />
                      </div>
                      <div className="h-52">
                        <TimeAndSales />
                      </div>
                    </>
                  )}

                  {rightPanelTab === 'watchlist' && (
                    <div className="flex-1">
                      <WatchlistPanel />
                    </div>
                  )}

                  {rightPanelTab === 'ticket' && (
                    <div className="flex-1">
                      <OrderTicket />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeView === 'watchlist' && (
            <div className="flex-1 p-3">
              <WatchlistPanel />
            </div>
          )}

          {activeView === 'screener' && <MarketScreenerView />}
          {activeView === 'portfolio' && <PortfolioAnalyticsView />}
          {activeView === 'papertrading' && (
            <div className="flex-1 p-3 flex flex-col gap-3">
              <div className="flex-1">
                <PositionsAndOrders />
              </div>
            </div>
          )}
          {activeView === 'risk' && <PortfolioAnalyticsView />}
          {activeView === 'backtest' && <BacktesterView />}
          {activeView === 'alerts' && <AlertsManagerView />}
          {activeView === 'calendar' && <EconomicCalendarView />}
          {activeView === 'news' && <NewsFeedView />}
          {activeView === 'journal' && <TradingJournalView />}
          {activeView === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Modals */}
      <CommandPalette />
      <RiskCalculatorModal />
    </div>
  );
};
