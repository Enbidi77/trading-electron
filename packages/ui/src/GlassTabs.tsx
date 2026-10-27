import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export interface GlassTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const GlassTabs: React.FC<GlassTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = ''
}) => {
  return (
    <div
      className={`inline-flex items-center p-1 rounded-lg bg-black/20 border border-white/5 backdrop-blur-md ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-150 select-none ${
              isActive
                ? 'bg-white/15 text-white shadow-sm border border-white/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-sky-500 text-white' : 'bg-white/10 text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
