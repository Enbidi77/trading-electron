import React from 'react';
import {
  BarChart2,
  List,
  Filter,
  PieChart,
  Repeat,
  ShieldCheck,
  History,
  Bell,
  Calendar,
  Newspaper,
  BookOpen,
  Settings
} from 'lucide-react';
import { useTerminalStore, type TerminalViewTab } from '../stores/useTerminalStore.js';

interface NavItem {
  id: TerminalViewTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'terminal', label: 'Terminal', icon: BarChart2 },
  { id: 'watchlist', label: 'Watchlists', icon: List },
  { id: 'screener', label: 'Screener', icon: Filter },
  { id: 'portfolio', label: 'Portfolio', icon: PieChart },
  { id: 'papertrading', label: 'Orders & Positions', icon: Repeat },
  { id: 'risk', label: 'Risk Engine', icon: ShieldCheck },
  { id: 'backtest', label: 'Strategy Backtest', icon: History },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'calendar', label: 'Economic Calendar', icon: Calendar },
  { id: 'news', label: 'Financial News', icon: Newspaper },
  { id: 'journal', label: 'Trading Journal', icon: BookOpen },
  { id: 'settings', label: 'Settings', icon: Settings }
];

export const SidebarDock: React.FC = () => {
  const { activeView, setActiveView } = useTerminalStore();

  return (
    <aside className="w-13 h-[calc(100vh-3rem)] flex flex-col items-center justify-between py-2 bg-[#090d16]/90 dark:bg-[#070a11]/90 backdrop-blur-2xl border-r border-white/10 z-20">
      {/* Top Navigation Items */}
      <div className="flex flex-col items-center gap-1 w-full px-1.5">
        {NAV_ITEMS.slice(0, 7).map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              title={item.label}
              className={`relative group w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-400/30 shadow-lg shadow-sky-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-sky-400 shadow-sm shadow-sky-400/50" />
              )}
              <Icon className="w-5 h-5 transition-transform group-hover:scale-105" />
            </button>
          );
        })}
      </div>

      {/* Bottom Navigation Items */}
      <div className="flex flex-col items-center gap-1 w-full px-1.5 pt-2 border-t border-white/10">
        {NAV_ITEMS.slice(7).map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              title={item.label}
              className={`relative group w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-400/30 shadow-lg shadow-sky-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-sky-400 shadow-sm shadow-sky-400/50" />
              )}
              <Icon className="w-5 h-5 transition-transform group-hover:scale-105" />
            </button>
          );
        })}
      </div>
    </aside>
  );
};
