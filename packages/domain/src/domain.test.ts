import { describe, it, expect } from 'vitest';
import {
  calculatePositionPnL,
  calculatePositionSize,
  computeHeikinAshi,
  computePivotPoints,
  estimateOrderCost
} from './index.js';
import type { Instrument } from '@trd/contracts';

const mockInstrument: Instrument = {
  symbol: 'BTC/USD',
  name: 'Bitcoin',
  assetClass: 'crypto',
  baseCurrency: 'BTC',
  quoteCurrency: 'USD',
  pricePrecision: 2,
  quantityPrecision: 4,
  tickSize: 0.5,
  minOrderQty: 0.001,
  lotSize: 0.001,
  contractMultiplier: 1,
  exchange: 'BINANCE'
};

describe('Domain Rules & Financial Calculations', () => {
  it('calculates order cost estimates correctly', () => {
    const estimate = estimateOrderCost(2, 50000, 0.001, 1);
    expect(estimate.notionalValue).toBe(100000);
    expect(estimate.estimatedFee).toBe(100);
    expect(estimate.requiredMargin).toBe(100000);
  });

  it('calculates Long position unrealized P&L and percent correctly', () => {
    const pnl = calculatePositionPnL('LONG', 2, 50000, 55000);
    expect(pnl.unrealizedPnL).toBe(10000);
    expect(pnl.unrealizedPnLPercent).toBe(10);
  });

  it('calculates Short position unrealized P&L correctly', () => {
    const pnl = calculatePositionPnL('SHORT', 1, 60000, 57000);
    expect(pnl.unrealizedPnL).toBe(3000);
    expect(pnl.unrealizedPnLPercent).toBe(5);
  });

  it('calculates position sizing respecting risk budget and stop loss', () => {
    const result = calculatePositionSize({
      accountEquity: 100000,
      riskPercent: 1, // $1,000 risk
      entryPrice: 50000,
      stopLossPrice: 48000, // $2,000 stop distance
      takeProfitPrice: 54000, // $4,000 profit distance
      instrument: mockInstrument
    });

    expect(result.isValid).toBe(true);
    expect(result.maxRiskAmount).toBe(1000);
    expect(result.positionQuantity).toBe(0.5); // 1000 / 2000 = 0.5 BTC
    expect(result.notionalValue).toBe(25000);
    expect(result.riskRewardRatio).toBe(2); // 4000 / 2000 = 2.0
  });

  it('computes Heikin-Ashi candles with smoothed OHLC', () => {
    const sampleCandles = [
      { time: 1000, open: 100, high: 105, low: 95, close: 104, volume: 100 },
      { time: 1060, open: 104, high: 110, low: 102, close: 108, volume: 120 }
    ];
    const ha = computeHeikinAshi(sampleCandles);
    expect(ha.length).toBe(2);
    expect(ha[0].close).toBe((100 + 105 + 95 + 104) / 4);
  });

  it('computes Pivot Points correctly', () => {
    const pivots = computePivotPoints(110, 90, 100);
    expect(pivots.pp).toBe(100);
    expect(pivots.r1).toBe(110);
    expect(pivots.s1).toBe(90);
  });
});
