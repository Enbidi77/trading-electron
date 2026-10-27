import { describe, it, expect } from 'vitest';
import { PaperBroker } from './index.js';

describe('PaperBroker', () => {
  it('initializes with default balance', async () => {
    const broker = new PaperBroker(100000);
    const bal = await broker.getAccountBalance();
    expect(bal.cash).toBe(100000);
    expect(bal.equity).toBe(100000);
  });

  it('executes market buy order and opens long position', async () => {
    const broker = new PaperBroker(100000);
    broker.onTick({ symbol: 'BTC/USD', price: 90000, size: 1, timestamp: 1700000000 });

    const order = await broker.placeOrder({
      symbol: 'BTC/USD',
      side: 'BUY',
      type: 'MARKET',
      quantity: 1
    });

    expect(order.status).toBe('FILLED');
    expect(order.avgFillPrice).toBe(90000);

    const positions = await broker.getPositions();
    expect(positions.length).toBe(1);
    expect(positions[0].symbol).toBe('BTC/USD');
    expect(positions[0].quantity).toBe(1);
    expect(positions[0].side).toBe('LONG');
  });

  it('calculates unrealized PnL when tick price moves', async () => {
    const broker = new PaperBroker(100000);
    broker.onTick({ symbol: 'AAPL', price: 200, size: 10, timestamp: 1700000000 });

    await broker.placeOrder({
      symbol: 'AAPL',
      side: 'BUY',
      type: 'MARKET',
      quantity: 10
    });

    broker.onTick({ symbol: 'AAPL', price: 210, size: 10, timestamp: 1700000010 });

    const positions = await broker.getPositions();
    expect(positions[0].unrealizedPnL).toBe(100); // 10 shares * $10 gain
    expect(positions[0].unrealizedPnLPercent).toBe(5); // 100 / 2000 = 5%
  });

  it('closes position and realizes profit', async () => {
    const broker = new PaperBroker(100000);
    broker.onTick({ symbol: 'NVDA', price: 100, size: 10, timestamp: 1700000000 });

    await broker.placeOrder({
      symbol: 'NVDA',
      side: 'BUY',
      type: 'MARKET',
      quantity: 10
    });

    broker.onTick({ symbol: 'NVDA', price: 120, size: 10, timestamp: 1700000010 });
    await broker.closePosition('NVDA');

    const positions = await broker.getPositions();
    expect(positions.length).toBe(0);

    const bal = await broker.getAccountBalance();
    expect(bal.realizedPnL).toBeGreaterThan(190); // ~200 minus fees
  });
});
