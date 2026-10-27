import React, { useState } from 'react';
import { Bell, Plus, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import type { AlertConditionType, AlertItem } from '@trd/contracts';
import { formatCurrency, formatPrice, formatTime } from '@trd/shared-utils';
import { useTerminalStore } from '../stores/useTerminalStore.js';

export const AlertsManagerView: React.FC = () => {
  const { activeSymbol, latestTicks } = useTerminalStore();
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
          <p className="text-xs text-slate-400">Manage real-time price thresholds, volatility, and order notifications</p>
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
              step="any"
              placeholder={formatPrice(currentPrice * 1.05)}
              value={newThreshold}
              onChange={(e) => setNewThreshold(e.target.value)}
              className="mt-1 w-full px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 font-mono text-sm text-slate-100 focus:outline-none focus:border-sky-500/50"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400">Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Resistance test"
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
            <span>Create Alert</span>
          </button>
        </form>

        {/* Alerts List */}
        <div className="md:col-span-2 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10 overflow-hidden flex flex-col">
          <div className="px-4 py-2 border-b border-white/5 text-xs font-semibold text-slate-300">
            Active Price Alerts ({alerts.length})
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
            {alerts.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">No active alerts set.</div>
            ) : (
              alerts.map((alt) => (
                <div key={alt.id} className="p-3 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-100">{alt.symbol}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">
                          {alt.conditionType.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-semibold text-sky-400">
                        {formatPrice(alt.thresholdPrice || 0)}
                      </span>
                      {alt.notes && <span className="text-[10px] text-slate-500">{alt.notes}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                      ACTIVE
                    </span>
                    <button
                      onClick={() => handleDeleteAlert(alt.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
