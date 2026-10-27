'use client';

import React, { useState } from 'react';
import { Bell, Plus, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import type { AlertConditionType, AlertItem } from '@trd/contracts';
import { formatCurrency, formatPrice, formatTime } from '@trd/shared-utils';
import { useWebTerminalStore } from '@/stores/useWebTerminalStore';

export const AlertsManagerView: React.FC = () => {
  const { activeSymbol, latestTicks } = useWebTerminalStore();
  const currentPrice = latestTicks[activeSymbol]?.price || 100;

  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: 'alt_1',
      symbol: 'BTC/USD',
      conditionType: 'PRICE_CROSS_ABOVE',
      thresholdPrice: 95000,
      active: true,
      createdAt: Math.floor(Date.now() / 1000) - 3600,
      notes: 'Key psychological resistance breakout'
    },
    {
      id: 'alt_2',
      symbol: 'ETH/USD',
      conditionType: 'PRICE_CROSS_BELOW',
      thresholdPrice: 3300,
      active: true,
      createdAt: Math.floor(Date.now() / 1000) - 7200,
      notes: 'Support retest trigger'
    }
  ]);

  const [newThreshold, setNewThreshold] = useState<string>('');
  const [newType, setNewType] = useState<AlertConditionType>('PRICE_CROSS_ABOVE');
  const [newNotes, setNewNotes] = useState<string>('');

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThreshold || Number(newThreshold) <= 0) return;

    const newAlert: AlertItem = {
      id: `alt_${Date.now()}`,
      symbol: activeSymbol,
      conditionType: newType,
      thresholdPrice: Number(newThreshold),
      active: true,
      createdAt: Math.floor(Date.now() / 1000),
      notes: newNotes
    };

    setAlerts([newAlert, ...alerts]);
    setNewThreshold('');
    setNewNotes('');
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  return (
    <div className="w-full h-full flex flex-col p-4 bg-[#070a11] gap-4 overflow-y-auto select-none">
      {/* Header */}
      <div className="flex items-center gap-2.5 p-4 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10">
        <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-base text-slate-100">Alerts & Real-Time Triggers</h1>
          <p className="text-xs text-slate-400">
            Manage real-time price thresholds, volatility, and order notifications
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Create Alert Form */}
        <form
          onSubmit={handleCreateAlert}
          className="p-4 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10 flex flex-col gap-3"
        >
          <h2 className="text-sm font-bold text-slate-200">Create New Alert</h2>

          <div>
            <label className="text-xs text-slate-400">Active Symbol</label>
            <div className="mt-1 px-3 py-1.5 rounded-lg bg-black/20 border border-white/5 font-mono text-sm font-bold text-slate-200">
              {activeSymbol} (Current: {formatPrice(currentPrice)})
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400">Condition</label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as any)}
              className="mt-1 w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-200 focus:outline-none"
            >
              <option value="PRICE_CROSS_ABOVE">Price Crosses Above</option>
              <option value="PRICE_CROSS_BELOW">Price Crosses Below</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400">Threshold Price</label>
            <input
              type="number"
              required
              step="any"
              placeholder="e.g. 96000"
              value={newThreshold}
              onChange={(e) => setNewThreshold(e.target.value)}
              className="mt-1 w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 font-mono text-xs text-white focus:outline-none focus:border-sky-500/50"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400">Notes (Optional)</label>
            <input
              type="text"
              placeholder="Breakout resistance..."
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="mt-1 w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-500/50"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Set Alert
          </button>
        </form>

        {/* Alerts List */}
        <div className="md:col-span-2 p-5 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10 flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <h2 className="text-sm font-bold text-slate-200">Active Triggers ({alerts.length})</h2>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Monitoring Feed
            </span>
          </div>

          <div className="divide-y divide-white/[0.04] max-h-96 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">No active alerts configured.</div>
            ) : (
              alerts.map((alt) => (
                <div key={alt.id} className="py-3 flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="font-bold text-slate-100">{alt.symbol}</span>
                      <span className="text-slate-400">
                        {alt.conditionType === 'PRICE_CROSS_ABOVE' ? '▲ crosses above' : '▼ crosses below'}
                      </span>
                      <span className="font-bold text-sky-400">
                        {alt.thresholdPrice ? formatPrice(alt.thresholdPrice) : '—'}
                      </span>
                    </div>
                    {alt.notes && <span className="text-[11px] text-slate-400">{alt.notes}</span>}
                    <span className="text-[10px] text-slate-500">{formatTime(alt.createdAt)}</span>
                  </div>

                  <button
                    onClick={() => handleDeleteAlert(alt.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

