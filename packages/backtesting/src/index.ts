import type { Candle } from '@trd/contracts';
import { calculateSMA, calculateRSI } from '@trd/indicators';
import { calculatePerformanceStats, type PerformanceStats } from '@trd/portfolio';

export interface BacktestTrade {
  entryTime: number;
  exitTime: number;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  pnlPercent: number;
}

export interface BacktestResult {
  stats: PerformanceStats;
  trades: BacktestTrade[];
  equityCurve: { time: number; equity: number }[];
}

export function runSmaCrossoverBacktest(
  candles: Candle[],
  fastPeriod: number = 9,
  slowPeriod: number = 21,
  initialCapital: number = 100000,
  tradeFraction: number = 0.5
): BacktestResult {
  if (candles.length < slowPeriod + 10) {
    return {
      stats: calculatePerformanceStats([]),
      trades: [],
      equityCurve: [{ time: candles[0]?.time || 0, equity: initialCapital }]
    };
  }

  const fastSMA = calculateSMA(candles, fastPeriod);
  const slowSMA = calculateSMA(candles, slowPeriod);

  const fastMap = new Map(fastSMA.map((p) => [p.time, p.value]));
  const slowMap = new Map(slowSMA.map((p) => [p.time, p.value]));

  let equity = initialCapital;
  const equityCurve: { time: number; equity: number }[] = [];
  const trades: BacktestTrade[] = [];

  let inPosition = false;
  let entryPrice = 0;
  let entryTime = 0;
  let positionQty = 0;

  for (let i = slowPeriod; i < candles.length; i++) {
    const c = candles[i];
    const prevC = candles[i - 1];

    const currentFast = fastMap.get(c.time);
    const currentSlow = slowMap.get(c.time);
    const prevFast = fastMap.get(prevC.time);
    const prevSlow = slowMap.get(prevC.time);

    if (
      currentFast !== undefined &&
      currentSlow !== undefined &&
      prevFast !== undefined &&
      prevSlow !== undefined
    ) {
      // Golden Cross: Buy Signal
      if (prevFast <= prevSlow && currentFast > currentSlow && !inPosition) {
        inPosition = true;
        entryPrice = c.close;
        entryTime = c.time;
        const capitalToCommit = equity * tradeFraction;
        positionQty = capitalToCommit / entryPrice;
      }
      // Death Cross: Exit Signal
      else if (prevFast >= prevSlow && currentFast < currentSlow && inPosition) {
        inPosition = false;
        const exitPrice = c.close;
        const pnl = (exitPrice - entryPrice) * positionQty;
        const pnlPercent = ((exitPrice - entryPrice) / entryPrice) * 100;
        equity += pnl;

        trades.push({
          entryTime,
          exitTime: c.time,
          side: 'LONG',
          entryPrice,
          exitPrice,
          pnl: Number(pnl.toFixed(2)),
          pnlPercent: Number(pnlPercent.toFixed(2))
        });
      }
    }

    // Record equity point
    const currentPnL = inPosition ? (c.close - entryPrice) * positionQty : 0;
    equityCurve.push({
      time: c.time,
      equity: Number((equity + currentPnL).toFixed(2))
    });
  }

  const tradePnLs = trades.map((t) => t.pnl);
  const stats = calculatePerformanceStats(tradePnLs);

  return {
    stats,
    trades,
    equityCurve
  };
}
