import type { Position } from '@trd/contracts';

export interface PerformanceStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  profitFactor: number;
  totalRealizedPnL: number;
  averageWin: number;
  averageLoss: number;
  maxDrawdownPercent: number;
}

export interface AllocationSlice {
  name: string;
  value: number;
  percent: number;
  color: string;
}

export function calculatePerformanceStats(tradePnLs: number[]): PerformanceStats {
  if (tradePnLs.length === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      profitFactor: 0,
      totalRealizedPnL: 0,
      averageWin: 0,
      averageLoss: 0,
      maxDrawdownPercent: 0
    };
  }

  const wins = tradePnLs.filter((p) => p > 0);
  const losses = tradePnLs.filter((p) => p < 0);

  const totalWins = wins.reduce((acc, v) => acc + v, 0);
  const totalLosses = Math.abs(losses.reduce((acc, v) => acc + v, 0));

  const winRate = Number(((wins.length / tradePnLs.length) * 100).toFixed(1));
  const profitFactor = totalLosses > 0 ? Number((totalWins / totalLosses).toFixed(2)) : totalWins > 0 ? 999 : 0;
  const averageWin = wins.length > 0 ? Number((totalWins / wins.length).toFixed(2)) : 0;
  const averageLoss = losses.length > 0 ? Number((totalLosses / losses.length).toFixed(2)) : 0;
  const totalRealizedPnL = Number((totalWins - totalLosses).toFixed(2));

  // Compute maximum peak-to-trough equity drawdown
  let peak = 100000;
  let equity = 100000;
  let maxDrawdown = 0;

  for (const p of tradePnLs) {
    equity += p;
    if (equity > peak) peak = equity;
    const dd = ((peak - equity) / peak) * 100;
    if (dd > maxDrawdown) maxDrawdown = dd;
  }

  return {
    totalTrades: tradePnLs.length,
    winningTrades: wins.length,
    losingTrades: losses.length,
    winRate,
    profitFactor,
    totalRealizedPnL,
    averageWin,
    averageLoss,
    maxDrawdownPercent: Number(maxDrawdown.toFixed(2))
  };
}

export function calculatePositionAllocations(positions: Position[], cash: number): AllocationSlice[] {
  const totalEquity = cash + positions.reduce((acc, p) => acc + p.marginUsed, 0);
  if (totalEquity <= 0) return [];

  const slices: AllocationSlice[] = [];
  const colors = ['#38bdf8', '#818cf8', '#34d399', '#f472b6', '#fbbf24', '#a78bfa'];

  // Cash slice
  slices.push({
    name: 'Cash',
    value: Number(cash.toFixed(2)),
    percent: Number(((cash / totalEquity) * 100).toFixed(1)),
    color: '#64748b'
  });

  positions.forEach((p, idx) => {
    slices.push({
      name: p.symbol,
      value: Number(p.marginUsed.toFixed(2)),
      percent: Number(((p.marginUsed / totalEquity) * 100).toFixed(1)),
      color: colors[idx % colors.length]
    });
  });

  return slices;
}
