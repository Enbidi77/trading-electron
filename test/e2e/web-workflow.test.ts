import { describe, it, expect } from 'vitest';
import { SimulatedMarketDataProvider } from '@trd/market-data-providers';
import { PaperBroker } from '@trd/paper-trading';
import { WorkspacePersistenceService, MemoryPersistenceAdapter } from '@trd/persistence';
import { runSmaCrossoverBacktest } from '@trd/backtesting';
import { screenInstruments } from '@trd/screener';
import { calculatePositionSize } from '@trd/domain';
import { verifyCredentials, registerUser } from '../../apps/web/src/lib/auth';

describe('End-to-End Web Trading Workflow', () => {
  it('executes full trader lifecycle: auth -> workspace -> market data -> order execution -> analytics', async () => {
    // 1. Trader signs in
    const user = verifyCredentials('demo@trdpro.io', 'password123');
    expect(user).not.toBeNull();
    expect(user?.role).toBe('pro');

    // 2. Load and customize workspace
    const persistence = new WorkspacePersistenceService(new MemoryPersistenceAdapter());
    const initialSettings = await persistence.getSettings();
    expect(initialSettings.activeSymbol).toBe('BTC/USD');

    await persistence.saveSettings({
      ...initialSettings,
      activeSymbol: 'ETH/USD',
      chartLayout: '1x2'
    });

    const savedSettings = await persistence.getSettings();
    expect(savedSettings.activeSymbol).toBe('ETH/USD');
    expect(savedSettings.chartLayout).toBe('1x2');

    // 3. Connect Market Data & Retrieve Historical Candles
    const provider = new SimulatedMarketDataProvider();
    await provider.connect();
    expect(provider.getStatus()).toBe('CONNECTED');

    const instruments = await provider.getInstruments();
    expect(instruments.length).toBeGreaterThanOrEqual(8);

    const ethCandles = await provider.getHistoricalCandles('ETH/USD', '15m', 100);
    expect(ethCandles.length).toBe(100);
    expect(ethCandles[0].close).toBeGreaterThan(0);

    // 4. Calculate Risk & Position Sizing
    const ethInst = instruments.find((i) => i.symbol === 'ETH/USD')!;
    const markPrice = ethCandles[ethCandles.length - 1].close;

    const sizeCalc = calculatePositionSize({
      accountEquity: 100000,
      riskPercent: 1.5,
      entryPrice: markPrice,
      stopLossPrice: markPrice * 0.97,
      takeProfitPrice: markPrice * 1.06,
      instrument: ethInst
    });

    expect(sizeCalc.isValid).toBe(true);
    expect(sizeCalc.positionQuantity).toBeGreaterThan(0);
    expect(sizeCalc.riskRewardRatio).toBeCloseTo(2.0, 1);

    // 5. Paper Trade Execution
    const broker = new PaperBroker(100000);
    broker.onTick({ symbol: 'ETH/USD', price: markPrice, size: 5, timestamp: 10000 });

    const order = await broker.placeOrder({
      symbol: 'ETH/USD',
      side: 'BUY',
      type: 'MARKET',
      quantity: sizeCalc.positionQuantity
    });

    expect(order.status).toBe('FILLED');

    const positions = await broker.getPositions();
    expect(positions.length).toBe(1);
    expect(positions[0].symbol).toBe('ETH/USD');
    expect(positions[0].quantity).toBe(sizeCalc.positionQuantity);

    // Market moves up
    broker.onTick({ symbol: 'ETH/USD', price: markPrice * 1.02, size: 1, timestamp: 10010 });
    const posAfterTick = (await broker.getPositions())[0];
    expect(posAfterTick.unrealizedPnL).toBeGreaterThan(0);

    // Close position
    await broker.closePosition('ETH/USD');
    const positionsAfterClose = await broker.getPositions();
    expect(positionsAfterClose.length).toBe(0);

    const finalBalance = await broker.getAccountBalance();
    expect(finalBalance.realizedPnL).toBeGreaterThan(0);

    // 6. Run Strategy Backtester on historical bars
    const backtest = runSmaCrossoverBacktest(ethCandles, 9, 21, 100000);
    expect(backtest.equityCurve.length).toBeGreaterThan(0);
    expect(backtest.stats).toBeDefined();

    // 7. Market Screener evaluation
    const screenerResults = screenInstruments(instruments, [
      {
        symbol: 'ETH/USD',
        name: 'Ethereum',
        price: markPrice,
        change24h: 45,
        changePercent24h: 3.2,
        volume24h: 80000000,
        high24h: markPrice * 1.03,
        low24h: markPrice * 0.98,
        rsi: 55
      }
    ], { assetClass: 'crypto', minPrice: 1000 });

    expect(screenerResults.length).toBe(1);
    expect(screenerResults[0].symbol).toBe('ETH/USD');
  });
});

