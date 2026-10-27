import type {
  Candle,
  Instrument,
  OrderBook,
  OrderBookLevel,
  Tick,
  TimeAndSalesTrade,
  Timeframe
} from '@trd/contracts';
import {
  type IMarketDataProvider,
  type ProviderStatus,
  timeframeToSeconds
} from '@trd/market-data';
import { generateId, roundToTickSize } from '@trd/shared-utils';

export const DEFAULT_INSTRUMENTS: Instrument[] = [
  {
    symbol: 'BTC/USD',
    name: 'Bitcoin / US Dollar',
    assetClass: 'crypto',
    baseCurrency: 'BTC',
    quoteCurrency: 'USD',
    pricePrecision: 2,
    quantityPrecision: 4,
    tickSize: 0.5,
    minOrderQty: 0.001,
    lotSize: 0.001,
    contractMultiplier: 1,
    description: 'Premier decentralized digital asset',
    exchange: 'BINANCE'
  },
  {
    symbol: 'ETH/USD',
    name: 'Ethereum / US Dollar',
    assetClass: 'crypto',
    baseCurrency: 'ETH',
    quoteCurrency: 'USD',
    pricePrecision: 2,
    quantityPrecision: 3,
    tickSize: 0.1,
    minOrderQty: 0.01,
    lotSize: 0.01,
    contractMultiplier: 1,
    description: 'Smart contract platform token',
    exchange: 'BINANCE'
  },
  {
    symbol: 'SOL/USD',
    name: 'Solana / US Dollar',
    assetClass: 'crypto',
    baseCurrency: 'SOL',
    quoteCurrency: 'USD',
    pricePrecision: 2,
    quantityPrecision: 2,
    tickSize: 0.05,
    minOrderQty: 0.1,
    lotSize: 0.1,
    contractMultiplier: 1,
    description: 'High throughput layer-1 blockchain',
    exchange: 'COINBASE'
  },
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    assetClass: 'equity',
    baseCurrency: 'AAPL',
    quoteCurrency: 'USD',
    pricePrecision: 2,
    quantityPrecision: 0,
    tickSize: 0.01,
    minOrderQty: 1,
    lotSize: 1,
    contractMultiplier: 1,
    description: 'Consumer electronics and software giant',
    exchange: 'NASDAQ'
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    assetClass: 'equity',
    baseCurrency: 'NVDA',
    quoteCurrency: 'USD',
    pricePrecision: 2,
    quantityPrecision: 0,
    tickSize: 0.01,
    minOrderQty: 1,
    lotSize: 1,
    contractMultiplier: 1,
    description: 'Leading GPU and AI hardware architecture',
    exchange: 'NASDAQ'
  },
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    assetClass: 'equity',
    baseCurrency: 'TSLA',
    quoteCurrency: 'USD',
    pricePrecision: 2,
    quantityPrecision: 0,
    tickSize: 0.01,
    minOrderQty: 1,
    lotSize: 1,
    contractMultiplier: 1,
    description: 'Electric vehicles and clean energy systems',
    exchange: 'NASDAQ'
  },
  {
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    assetClass: 'forex',
    baseCurrency: 'EUR',
    quoteCurrency: 'USD',
    pricePrecision: 5,
    quantityPrecision: 0,
    tickSize: 0.00005,
    minOrderQty: 1000,
    lotSize: 1000,
    contractMultiplier: 1,
    description: 'Major foreign exchange currency pair',
    exchange: 'FXCM'
  },
  {
    symbol: 'SPY',
    name: 'SPDR S&P 500 ETF Trust',
    assetClass: 'index',
    baseCurrency: 'SPY',
    quoteCurrency: 'USD',
    pricePrecision: 2,
    quantityPrecision: 0,
    tickSize: 0.01,
    minOrderQty: 1,
    lotSize: 1,
    contractMultiplier: 1,
    description: 'Benchmark ETF tracking the S&P 500 index',
    exchange: 'NYSE ARCA'
  }
];

export const INITIAL_BASE_PRICES: Record<string, number> = {
  'BTC/USD': 92450.0,
  'ETH/USD': 3420.0,
  'SOL/USD': 188.5,
  'AAPL': 228.4,
  'NVDA': 142.8,
  'TSLA': 264.2,
  'EUR/USD': 1.0845,
  'SPY': 585.5
};

export class SimulatedMarketDataProvider implements IMarketDataProvider {
  readonly id = 'simulated';
  readonly name = 'High-Fidelity Simulated Feed';

  private status: ProviderStatus = 'DISCONNECTED';
  private instruments: Map<string, Instrument> = new Map();
  private currentPrices: Map<string, number> = new Map();
  private tickListeners: Map<string, Set<(tick: Tick) => void>> = new Map();
  private bookListeners: Map<string, Set<(book: OrderBook) => void>> = new Map();
  private tradeListeners: Map<string, Set<(trade: TimeAndSalesTrade) => void>> = new Map();
  private timer: any = null;

  constructor(customInstruments?: Instrument[]) {
    const list = customInstruments || DEFAULT_INSTRUMENTS;
    for (const inst of list) {
      this.instruments.set(inst.symbol, inst);
      this.currentPrices.set(inst.symbol, INITIAL_BASE_PRICES[inst.symbol] || 100);
    }
  }

  public getStatus(): ProviderStatus {
    return this.status;
  }

  public async connect(): Promise<void> {
    this.status = 'CONNECTING';
    await new Promise((r) => setTimeout(r, 100)); // simulated connection handshake
    this.status = 'CONNECTED';
    this.startSimulationLoop();
  }

  public async disconnect(): Promise<void> {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.status = 'DISCONNECTED';
  }

  public async getInstruments(): Promise<Instrument[]> {
    return Array.from(this.instruments.values());
  }

  public async getHistoricalCandles(
    symbol: string,
    timeframe: Timeframe,
    limit: number = 300
  ): Promise<Candle[]> {
    const inst = this.instruments.get(symbol);
    const tickSize = inst?.tickSize || 0.01;
    let basePrice = this.currentPrices.get(symbol) || 100;
    const intervalSec = timeframeToSeconds(timeframe);
    const nowSec = Math.floor(Date.now() / 1000);
    const startTime = nowSec - limit * intervalSec;

    const candles: Candle[] = [];
    let currentClose = basePrice * 0.92; // start slightly earlier to create a realistic path

    // Deterministic random walk with trend component
    for (let i = 0; i < limit; i++) {
      const time = startTime + i * intervalSec;
      const volatility = 0.0035; // typical bar volatility
      const drift = 0.0001; // slight upward drift
      const shock = (Math.random() - 0.49) * 2 * volatility;
      const open = currentClose;
      const change = open * (drift + shock);
      const close = roundToTickSize(open + change, tickSize);
      const high = roundToTickSize(
        Math.max(open, close) + Math.random() * volatility * open * 1.5,
        tickSize
      );
      const low = roundToTickSize(
        Math.min(open, close) - Math.random() * volatility * open * 1.5,
        tickSize
      );
      const volume = Math.round(500 + Math.random() * 2000);

      candles.push({
        time,
        open,
        high,
        low,
        close,
        volume
      });

      currentClose = close;
    }

    // Set the latest simulated price
    this.currentPrices.set(symbol, currentClose);
    return candles;
  }

  public subscribeTicks(symbol: string, onTick: (tick: Tick) => void): () => void {
    if (!this.tickListeners.has(symbol)) {
      this.tickListeners.set(symbol, new Set());
    }
    this.tickListeners.get(symbol)!.add(onTick);

    return () => {
      this.tickListeners.get(symbol)?.delete(onTick);
    };
  }

  public subscribeOrderBook(symbol: string, onBook: (book: OrderBook) => void): () => void {
    if (!this.bookListeners.has(symbol)) {
      this.bookListeners.set(symbol, new Set());
    }
    this.bookListeners.get(symbol)!.add(onBook);

    // Immediately push initial book
    const initialBook = this.generateOrderBook(symbol);
    onBook(initialBook);

    return () => {
      this.bookListeners.get(symbol)?.delete(onBook);
    };
  }

  public subscribeTrades(symbol: string, onTrade: (trade: TimeAndSalesTrade) => void): () => void {
    if (!this.tradeListeners.has(symbol)) {
      this.tradeListeners.set(symbol, new Set());
    }
    this.tradeListeners.get(symbol)!.add(onTrade);

    return () => {
      this.tradeListeners.get(symbol)?.delete(onTrade);
    };
  }

  private startSimulationLoop(): void {
    if (this.timer) clearInterval(this.timer);

    // Emits ticks and book updates at 150ms intervals (~6-7 events/sec) for lively terminal feel
    this.timer = setInterval(() => {
      for (const [symbol, inst] of this.instruments.entries()) {
        const hasTickSubs = (this.tickListeners.get(symbol)?.size || 0) > 0;
        const hasBookSubs = (this.bookListeners.get(symbol)?.size || 0) > 0;
        const hasTradeSubs = (this.tradeListeners.get(symbol)?.size || 0) > 0;

        if (!hasTickSubs && !hasBookSubs && !hasTradeSubs) continue;

        const currentPrice = this.currentPrices.get(symbol) || 100;
        const tickSize = inst.tickSize;
        const tickDelta = (Math.random() - 0.495) * tickSize * (1 + Math.floor(Math.random() * 3));
        const newPrice = roundToTickSize(Math.max(tickSize, currentPrice + tickDelta), tickSize);
        this.currentPrices.set(symbol, newPrice);

        const now = Math.floor(Date.now() / 1000);
        const side = newPrice >= currentPrice ? 'buy' : 'sell';
        const size = Number((Math.random() * 2 + 0.1).toFixed(inst.quantityPrecision));

        // 1. Emit Tick
        const tick: Tick = {
          symbol,
          price: newPrice,
          size,
          timestamp: now,
          side
        };
        this.tickListeners.get(symbol)?.forEach((cb) => cb(tick));

        // 2. Emit Trade print periodically
        if (Math.random() > 0.3) {
          const trade: TimeAndSalesTrade = {
            id: generateId('trd'),
            symbol,
            timestamp: now,
            price: newPrice,
            size,
            side
          };
          this.tradeListeners.get(symbol)?.forEach((cb) => cb(trade));
        }

        // 3. Emit OrderBook Level 2 update
        if (hasBookSubs && Math.random() > 0.2) {
          const book = this.generateOrderBook(symbol);
          this.bookListeners.get(symbol)?.forEach((cb) => cb(book));
        }
      }
    }, 150);
  }

  public generateOrderBook(symbol: string): OrderBook {
    const inst = this.instruments.get(symbol);
    const midPrice = this.currentPrices.get(symbol) || 100;
    const tickSize = inst?.tickSize || 0.01;
    const precision = inst?.quantityPrecision || 2;

    const bids: OrderBookLevel[] = [];
    const asks: OrderBookLevel[] = [];

    const depth = 10;
    let bidTotal = 0;
    let askTotal = 0;

    for (let i = 1; i <= depth; i++) {
      const bidPrice = roundToTickSize(midPrice - i * tickSize, tickSize);
      const askPrice = roundToTickSize(midPrice + i * tickSize, tickSize);

      const bidSize = Number((Math.random() * 5 + 0.5).toFixed(precision));
      const askSize = Number((Math.random() * 5 + 0.5).toFixed(precision));

      bidTotal += bidSize;
      askTotal += askSize;

      bids.push({
        price: bidPrice,
        size: bidSize,
        total: Number(bidTotal.toFixed(precision))
      });

      asks.push({
        price: askPrice,
        size: askSize,
        total: Number(askTotal.toFixed(precision))
      });
    }

    return {
      symbol,
      timestamp: Math.floor(Date.now() / 1000),
      bids,
      asks
    };
  }
}
