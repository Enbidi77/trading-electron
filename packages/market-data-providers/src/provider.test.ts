import { describe, it, expect } from 'vitest';
import { SimulatedMarketDataProvider } from './index.js';

describe('SimulatedMarketDataProvider', () => {
  it('initializes instruments correctly', async () => {
    const provider = new SimulatedMarketDataProvider();
    await provider.connect();
    const instruments = await provider.getInstruments();
    expect(instruments.length).toBeGreaterThan(0);
    expect(instruments.some((i) => i.symbol === 'BTC/USD')).toBe(true);
    await provider.disconnect();
  });

  it('generates consistent historical candles', async () => {
    const provider = new SimulatedMarketDataProvider();
    const candles = await provider.getHistoricalCandles('BTC/USD', '15m', 50);
    expect(candles.length).toBe(50);
    for (const c of candles) {
      expect(c.high).toBeGreaterThanOrEqual(c.open);
      expect(c.high).toBeGreaterThanOrEqual(c.close);
      expect(c.low).toBeLessThanOrEqual(c.open);
      expect(c.low).toBeLessThanOrEqual(c.close);
      expect(c.volume).toBeGreaterThan(0);
    }
  });

  it('generates order books with valid bid/ask depth ladder', () => {
    const provider = new SimulatedMarketDataProvider();
    const book = provider.generateOrderBook('BTC/USD');
    expect(book.bids.length).toBe(10);
    expect(book.asks.length).toBe(10);
    expect(book.bids[0].price).toBeLessThan(book.asks[0].price);
  });
});
