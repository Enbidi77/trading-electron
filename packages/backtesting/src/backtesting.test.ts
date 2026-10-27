import { describe, it, expect } from 'vitest';
import type { Candle } from '@trd/contracts';
import { runSmaCrossoverBacktest } from './index.js';

describe('Backtesting Engine', () => {
  it('runs SMA crossover strategy and records trades and equity curve', () => {
    // Generate trending cycle candles
    const candles: Candle[] = Array.from({ length: 100 }, (_, i) => {
      const price = 100 + Math.sin(i / 10) * 20;
      return {
        time: 1700000000 + i * 3600,
        open: price,
        high: price + 1,
        low: price - 1,
        close: price + 0.5,
        volume: 5000
      };
    });

    const result = runSmaCrossoverBacktest(candles, 5, 15, 100000);
    expect(result.equityCurve.length).toBeGreaterThan(0);
    expect(result.trades.length).toBeGreaterThanOrEqual(0);
    expect(result.stats).toBeDefined();
  });
});
