import React, { useState } from 'react';
import { formatCurrency, formatPercent, formatPrice, formatTime } from '@trd/shared-utils';
import { GlassTabs } from '@trd/ui';
import { useTerminalStore } from '../stores/useTerminalStore.js';

export const PositionsAndOrders: React.FC = () => {
  const { positions, orders, closePosition, cancelOrder } = useTerminalStore();
  const [activeTab, setActiveTab] = useState<'positions' | 'orders' | 'history'>('positions');

  const openOrders = orders.filter((o) => o.status === 'OPEN' || o.status === 'PENDING');
  const filledOrders = orders.filter((o) => o.status === 'FILLED' || o.status === 'CANCELLED');

  return (
    <div className="w-full h-full flex flex-col bg-[#090d16]/85 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden select-none">
      {/* Top Tabs */}
      <div className="h-8 flex items-center justify-between px-3 bg-white/5 border-b border-white/5 text-xs">
        <GlassTabs
          tabs={[
            { id: 'positions', label: 'Open Positions', count: positions.length },
            { id: 'orders', label: 'Resting Orders', count: openOrders.length },
            { id: 'history', label: 'Order History', count: filledOrders.length }
          ]}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as any)}
        />
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-x-auto overflow-y-auto font-mono text-xs">
        {activeTab === 'positions' && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] text-slate-400 bg-black/20">
                <th className="py-1.5 px-3">SYMBOL</th>
                <th className="py-1.5 px-3">SIDE</th>
                <th className="py-1.5 px-3">QTY</th>
                <th className="py-1.5 px-3">ENTRY</th>
                <th className="py-1.5 px-3">MARK</th>
                <th className="py-1.5 px-3">UNREALIZED P&L</th>
                <th className="py-1.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {positions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500">
                    No active positions currently open.
                  </td>
                </tr>
              ) : (
                positions.map((pos) => {
                  const isLong = pos.side === 'LONG';
                  const isProfit = pos.unrealizedPnL >= 0;
                  return (
                    <tr key={pos.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-2 px-3 font-semibold text-slate-100">{pos.symbol}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            isLong ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {pos.side}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-200">{pos.quantity}</td>
                      <td className="py-2 px-3 text-slate-300">{formatPrice(pos.avgEntryPrice)}</td>
                      <td className="py-2 px-3 text-slate-300">{formatPrice(pos.currentPrice)}</td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1.5 font-semibold">
                          <span className={isProfit ? 'text-emerald-400' : 'text-rose-400'}>
                            {formatCurrency(pos.unrealizedPnL)}
                          </span>
                          <span
                            className={`text-[10px] px-1 rounded ${
                              isProfit ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                            }`}
                          >
                            {formatPercent(pos.unrealizedPnLPercent)}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => closePosition(pos.symbol)}
                          className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-[10px] font-semibold transition-all cursor-pointer"
                        >
                          Close
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'orders' && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] text-slate-400 bg-black/20">
                <th className="py-1.5 px-3">ID</th>
                <th className="py-1.5 px-3">SYMBOL</th>
                <th className="py-1.5 px-3">SIDE</th>
                <th className="py-1.5 px-3">TYPE</th>
                <th className="py-1.5 px-3">QTY</th>
                <th className="py-1.5 px-3">PRICE</th>
                <th className="py-1.5 px-3">STATUS</th>
                <th className="py-1.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {openOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-500">
                    No active resting orders.
                  </td>
                </tr>
              ) : (
                openOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-2 px-3 text-slate-500 text-[10px]">{ord.id}</td>
                    <td className="py-2 px-3 font-semibold text-slate-100">{ord.symbol}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          ord.side === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {ord.side}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-300">{ord.type}</td>
                    <td className="py-2 px-3 text-slate-200">{ord.quantity}</td>
                    <td className="py-2 px-3 text-slate-300">
                      {ord.limitPrice ? formatPrice(ord.limitPrice) : 'MKT'}
                    </td>
                    <td className="py-2 px-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-sky-500/20 text-sky-400 font-semibold">
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => cancelOrder(ord.id)}
                        className="px-2 py-0.5 rounded bg-white/10 hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 text-[10px] transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'history' && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] text-slate-400 bg-black/20">
                <th className="py-1.5 px-3">TIME</th>
                <th className="py-1.5 px-3">SYMBOL</th>
                <th className="py-1.5 px-3">SIDE</th>
                <th className="py-1.5 px-3">TYPE</th>
                <th className="py-1.5 px-3">QTY</th>
                <th className="py-1.5 px-3">AVG FILL</th>
                <th className="py-1.5 px-3">FEE</th>
                <th className="py-1.5 px-3">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filledOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-500">
                    No order history yet.
                  </td>
                </tr>
              ) : (
                filledOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-2 px-3 text-slate-400 text-[10px]">{formatTime(ord.updatedAt)}</td>
                    <td className="py-2 px-3 font-semibold text-slate-100">{ord.symbol}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          ord.side === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {ord.side}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-300">{ord.type}</td>
                    <td className="py-2 px-3 text-slate-200">{ord.filledQuantity || ord.quantity}</td>
                    <td className="py-2 px-3 text-slate-300">
                      {ord.avgFillPrice ? formatPrice(ord.avgFillPrice) : '—'}
                    </td>
                    <td className="py-2 px-3 text-slate-400">{formatCurrency(ord.fee || 0)}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          ord.status === 'FILLED'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-white/10 text-slate-400'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
