import { describe, it, expect } from 'vitest';
import type { Candle } from '@trd/contracts';
import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateBollingerBands,
  calculateMACD,
  calculateATR,
  calculateOBV
} from './index.js';

const mockCandles: Candle[] = Array.from({ length: 50 }, (_, i) => {
  const base = 100 + i * 0.5 + Math.sin(i / 3) * 5;
  return {
    time: 1700000000 + i * 60,
    open: base - 0.2,
    high: base + 1.5,
    low: base - 1.2,
    close: base + 0.3,
    volume: 1000 + i * 20
  };
});

describe('Indicator Calculations', () => {
  it('computes SMA correctly', () => {
    const period = 10;
    const sma = calculateSMA(mockCandles, period);
    expect(sma.length).toBe(mockCandles.length - period + 1);
    expect(sma[0].value).toBeGreaterThan(90);
    expect(sma[0].time).toBe(mockCandles[period - 1].time);
  });

  it('computes EMA correctly', () => {
    const period = 12;
    const ema = calculateEMA(mockCandles, period);
    expect(ema.length).toBe(mockCandles.length - period + 1);
    expect(ema[0].value).toBeGreaterThan(90);
  });

  it('computes RSI within bounds [0, 100]', () => {
    const rsi = calculateRSI(mockCandles, 14);
    expect(rsi.length).toBeGreaterThan(0);
    for (const point of rsi) {
      expect(point.value).toBeGreaterThanOrEqual(0);
      expect(point.value).toBeLessThanOrEqual(100);
    }
  });

  it('computes Bollinger Bands with upper > middle > lower', () => {
    const bb = calculateBollingerBands(mockCandles, 20, 2);
    expect(bb.length).toBe(mockCandles.length - 20 + 1);
    for (const point of bb) {
      expect(point.upper).toBeGreaterThanOrEqual(point.middle);
      expect(point.middle).toBeGreaterThanOrEqual(point.lower);
      expect(point.bandwidth).toBeGreaterThan(0);
    }
  });

  it('computes MACD points with consistent histogram = macd - signal', () => {
    const macd = calculateMACD(mockCandles, 12, 26, 9);
    expect(macd.length).toBeGreaterThan(0);
    for (const pt of macd) {
      const diff = Math.abs(pt.histogram - (pt.macd - pt.signal));
      expect(diff).toBeLessThan(0.001);
    }
  });

  it('computes ATR with positive values', () => {
    const atr = calculateATR(mockCandles, 14);
    expect(atr.length).toBeGreaterThan(0);
    for (const pt of atr) {
      expect(pt.value).toBeGreaterThan(0);
    }
  });

  it('computes OBV correctly', () => {
    const obv = calculateOBV(mockCandles);
    expect(obv.length).toBe(mockCandles.length);
    expect(obv[0].value).toBe(0);
  });
});
