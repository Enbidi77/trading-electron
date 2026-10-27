import type {
  Candle,
  Instrument,
  OrderBook,
  Tick,
  TimeAndSalesTrade,
  Timeframe
} from '@trd/contracts';
import { TypedEventEmitter } from '@trd/shared-utils';

export type ProviderStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';

export interface IMarketDataProvider {
  readonly id: string;
  readonly name: string;
  getStatus(): ProviderStatus;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getInstruments(): Promise<Instrument[]>;
  getHistoricalCandles(symbol: string, timeframe: Timeframe, limit?: number): Promise<Candle[]>;
  subscribeTicks(symbol: string, onTick: (tick: Tick) => void): () => void;
  subscribeOrderBook(symbol: string, onBook: (book: OrderBook) => void): () => void;
  subscribeTrades(symbol: string, onTrade: (trade: TimeAndSalesTrade) => void): () => void;
}

export function timeframeToSeconds(timeframe: Timeframe): number {
  switch (timeframe) {
    case '1s':
      return 1;
    case '1m':
      return 60;
    case '3m':
      return 180;
    case '5m':
      return 300;
    case '15m':
      return 900;
    case '30m':
      return 1800;
    case '1h':
      return 3600;
    case '2h':
      return 7200;
    case '4h':
      return 14400;
    case '1D':
      return 86400;
    case '1W':
      return 604800;
    default:
      return 60;
  }
}

/**
 * Aggregates live ticks into real-time forming candles of a given timeframe.
 */
export class LiveCandleAggregator {
  private currentCandle: Candle | null = null;
  private intervalSeconds: number;
  private onCandleUpdate: (candle: Candle, isNewCandle: boolean) => void;

  constructor(timeframe: Timeframe, onCandleUpdate: (candle: Candle, isNewCandle: boolean) => void) {
    this.intervalSeconds = timeframeToSeconds(timeframe);
    this.onCandleUpdate = onCandleUpdate;
  }

  public setInitialCandle(lastHistoricalCandle: Candle): void {
    this.currentCandle = { ...lastHistoricalCandle };
  }

  public processTick(tick: Tick): void {
    const candleBucketTime = Math.floor(tick.timestamp / this.intervalSeconds) * this.intervalSeconds;

    if (!this.currentCandle || candleBucketTime > this.currentCandle.time) {
      // New candle started
      const newCandle: Candle = {
        time: candleBucketTime,
        open: tick.price,
        high: tick.price,
        low: tick.price,
        close: tick.price,
        volume: tick.size
      };
      this.currentCandle = newCandle;
      this.onCandleUpdate(newCandle, true);
    } else {
      // Update existing active candle
      this.currentCandle.high = Math.max(this.currentCandle.high, tick.price);
      this.currentCandle.low = Math.min(this.currentCandle.low, tick.price);
      this.currentCandle.close = tick.price;
      this.currentCandle.volume += tick.size;
      this.onCandleUpdate(this.currentCandle, false);
    }
  }

  public getCurrentCandle(): Candle | null {
    return this.currentCandle ? { ...this.currentCandle } : null;
  }
}

export interface MarketDataFeedEvents {
  status: ProviderStatus;
  tick: { symbol: string; tick: Tick };
  orderbook: { symbol: string; book: OrderBook };
  trade: { symbol: string; trade: TimeAndSalesTrade };
}

export class MarketDataFeedService extends TypedEventEmitter<MarketDataFeedEvents> {
  private activeProvider: IMarketDataProvider;

  constructor(provider: IMarketDataProvider) {
    super();
    this.activeProvider = provider;
  }

  public getProvider(): IMarketDataProvider {
    return this.activeProvider;
  }

  public setProvider(provider: IMarketDataProvider): void {
    this.activeProvider = provider;
    this.emit('status', provider.getStatus());
  }

  public async init(): Promise<void> {
    await this.activeProvider.connect();
    this.emit('status', this.activeProvider.getStatus());
  }
}
