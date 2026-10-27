'use client';

import React, { useState } from 'react';
import { Settings, Moon, Sun, Key, Database, RefreshCw, Download, Upload, Shield } from 'lucide-react';
import { useWebTerminalStore } from '@/stores/useWebTerminalStore';
import { api } from '@/lib/api-client';

export const SettingsView: React.FC = () => {
  const { settings, toggleTheme, providerStatus, watchlists, drawings } = useWebTerminalStore();
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleExportWorkspace = () => {
    const data = {
      settings,
      watchlists,
      drawings,
      exportedAt: new Date().toISOString(),
      platform: 'TRD Pro Web'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trd_pro_workspace_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMsg('Workspace exported successfully');
    setTimeout(() => setStatusMsg(null), 3000);
  };

  return (
    <div className="w-full h-full flex flex-col p-4 bg-[#070a11] gap-4 overflow-y-auto select-none">
      <div className="flex items-center gap-2.5 p-4 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10">
        <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-base text-slate-100">Application & Terminal Settings</h1>
          <p className="text-xs text-slate-400">
            Configure visual themes, data connection feeds, and workspace persistence
          </p>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
          {statusMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Appearance & Workspace */}
        <div className="p-5 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-slate-200">Appearance & Theme</h2>

          <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-200">Active Theme</span>
              <span className="text-[11px] text-slate-400">
                Current: {settings.theme.toUpperCase()} (Liquid Glass)
              </span>
            </div>
            <button
              onClick={toggleTheme}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {settings.theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-sky-400" />
              )}
              <span>Switch to {settings.theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-200">Sound Effects</span>
              <span className="text-[11px] text-slate-400">
                Acoustic cues on order fills & bracket triggers
              </span>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">ENABLED</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-200">Multi-Chart Crosshair Sync</span>
              <span className="text-[11px] text-slate-400">
                Synchronize price & timestamp crosshairs across grid panes
              </span>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">ACTIVE</span>
          </div>
        </div>

        {/* Persistence & Data Sync */}
        <div className="p-5 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-slate-200">Persistence & Synchronization</h2>

          <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-200">Sync Adapter</span>
              <span className="text-[11px] text-slate-400">
                Browser LocalStorage + Server Route Handlers
              </span>
            </div>
            <span className="text-xs font-mono text-sky-400 font-bold">HTTP + LOCAL</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-200">Market Data Feed Status</span>
              <span className="text-[11px] text-slate-400">High-fidelity deterministic tick walk</span>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              {providerStatus}
            </span>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              onClick={handleExportWorkspace}
              className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Layout JSON</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

