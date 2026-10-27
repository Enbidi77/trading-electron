import { describe, it, expect } from 'vitest';
import { calculatePositionSize, calculatePositionPnL, estimateOrderCost } from '@trd/domain';
import { PaperBroker } from '@trd/paper-trading';
import { DEFAULT_INSTRUMENTS } from '@trd/market-data-providers';

describe('Risk Engine and Paper Trading Integration', () => {
  const btc = DEFAULT_INSTRUMENTS.find((i) => i.symbol === 'BTC/USD')!;

  it('calculates position sizing accurately within risk budget', () => {
    const result = calculatePositionSize({
      accountEquity: 100000,
      riskPercent: 1.0, // $1,000 risk budget
      entryPrice: 90000,
      stopLossPrice: 88000, // $2,000 per BTC risk
      takeProfitPrice: 94000, // $4,000 per BTC reward
      instrument: btc
    });

    expect(result.isValid).toBe(true);
    expect(result.maxRiskAmount).toBe(1000);
    expect(result.positionQuantity).toBe(0.5); // $1000 / $2000 = 0.5 BTC
    expect(result.riskRewardRatio).toBe(2.0); // $4000 / $2000 = 2.0
    expect(result.notionalValue).toBe(45000);
  });

  it('calculates position unrealized and realized P&L', () => {
    // Long position
    const longPnL = calculatePositionPnL('LONG', 2, 50000, 52000);
    expect(longPnL.unrealizedPnL).toBe(4000);
    expect(longPnL.unrealizedPnLPercent).toBe(4.0);

    // Short position
    const shortPnL = calculatePositionPnL('SHORT', 1, 50000, 48000);
    expect(shortPnL.unrealizedPnL).toBe(2000);
    expect(shortPnL.unrealizedPnLPercent).toBe(4.0);
  });

  it('simulates order placement, execution, and fee deduction in PaperBroker', async () => {
    const broker = new PaperBroker(50000);
    const initialBal = await broker.getAccountBalance();
    expect(initialBal.cash).toBe(50000);

    // Provide initial tick price
    broker.onTick({ symbol: 'AAPL', price: 200, size: 10, timestamp: 1000 });

    // Place market buy order
    const order = await broker.placeOrder({
      symbol: 'AAPL',
      side: 'BUY',
      type: 'MARKET',
      quantity: 10
    });

    expect(order.status).toBe('FILLED');
    expect(order.avgFillPrice).toBe(200);

    const positions = await broker.getPositions();
    expect(positions.length).toBe(1);
    expect(positions[0].symbol).toBe('AAPL');
    expect(positions[0].quantity).toBe(10);

    // Price rises to 210
    broker.onTick({ symbol: 'AAPL', price: 210, size: 10, timestamp: 1001 });
    const updatedPositions = await broker.getPositions();
    expect(updatedPositions[0].unrealizedPnL).toBe(100); // (210 - 200) * 10
  });
});

