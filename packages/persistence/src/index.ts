import type {
  ChartDrawing,
  IndicatorConfig,
  UserSettings,
  Watchlist
} from '@trd/contracts';

export const DEFAULT_USER_SETTINGS: UserSettings = {
  theme: 'dark',
  activeSymbol: 'BTC/USD',
  activeTimeframe: '15m',
  chartLayout: '1x1',
  activeWatchlistId: 'default',
  defaultOrderQuantity: 1,
  paperTradingInitialBalance: 100000,
  soundEnabled: true,
  chartSyncCrosshair: true,
  chartSyncTimeframe: false
};

export const DEFAULT_WATCHLISTS: Watchlist[] = [
  {
    id: 'default',
    name: 'Main Watchlist',
    symbols: ['BTC/USD', 'ETH/USD', 'SOL/USD', 'AAPL', 'NVDA', 'TSLA', 'EUR/USD', 'SPY']
  },
  {
    id: 'crypto',
    name: 'Crypto High Cap',
    symbols: ['BTC/USD', 'ETH/USD', 'SOL/USD']
  },
  {
    id: 'equities',
    name: 'US Tech Leaders',
    symbols: ['AAPL', 'NVDA', 'TSLA']
  }
];

export interface IPersistenceAdapter {
  get<T>(key: string, defaultValue: T): Promise<T>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

export class MemoryPersistenceAdapter implements IPersistenceAdapter {
  private store: Map<string, any> = new Map();

  public async get<T>(key: string, defaultValue: T): Promise<T> {
    if (this.store.has(key)) {
      return this.store.get(key) as T;
    }
    return defaultValue;
  }

  public async set<T>(key: string, value: T): Promise<void> {
    this.store.set(key, value);
  }

  public async remove(key: string): Promise<void> {
    this.store.delete(key);
  }

  public async clear(): Promise<void> {
    this.store.clear();
  }
}

export class LocalStoragePersistenceAdapter implements IPersistenceAdapter {
  private prefix: string;

  constructor(prefix: string = 'trd_term_') {
    this.prefix = prefix;
  }

  public async get<T>(key: string, defaultValue: T): Promise<T> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = window.localStorage.getItem(this.prefix + key);
        if (item !== null) {
          return JSON.parse(item) as T;
        }
      }
    } catch (err) {
      console.warn(`Failed to read from localStorage key ${key}:`, err);
    }
    return defaultValue;
  }

  public async set<T>(key: string, value: T): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(this.prefix + key, JSON.stringify(value));
      }
    } catch (err) {
      console.warn(`Failed to write to localStorage key ${key}:`, err);
    }
  }

  public async remove(key: string): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(this.prefix + key);
      }
    } catch (err) {
      console.warn(`Failed to remove localStorage key ${key}:`, err);
    }
  }

  public async clear(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const keysToRemove: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (k && k.startsWith(this.prefix)) {
            keysToRemove.push(k);
          }
        }
        for (const k of keysToRemove) {
          window.localStorage.removeItem(k);
        }
      }
    } catch (err) {
      console.warn('Failed to clear localStorage:', err);
    }
  }
}

export class WorkspacePersistenceService {
  private adapter: IPersistenceAdapter;

  constructor(adapter?: IPersistenceAdapter) {
    this.adapter =
      adapter ||
      (typeof window !== 'undefined' && window.localStorage
        ? new LocalStoragePersistenceAdapter()
        : new MemoryPersistenceAdapter());
  }

  public async getSettings(): Promise<UserSettings> {
    return this.adapter.get<UserSettings>('settings', DEFAULT_USER_SETTINGS);
  }

  public async saveSettings(settings: UserSettings): Promise<void> {
    await this.adapter.set('settings', settings);
  }

  public async getWatchlists(): Promise<Watchlist[]> {
    return this.adapter.get<Watchlist[]>('watchlists', DEFAULT_WATCHLISTS);
  }

  public async saveWatchlists(watchlists: Watchlist[]): Promise<void> {
    await this.adapter.set('watchlists', watchlists);
  }

  public async getDrawings(symbol: string): Promise<ChartDrawing[]> {
    return this.adapter.get<ChartDrawing[]>(`drawings_${symbol}`, []);
  }

  public async saveDrawings(symbol: string, drawings: ChartDrawing[]): Promise<void> {
    await this.adapter.set(`drawings_${symbol}`, drawings);
  }

  public async getIndicators(symbol: string): Promise<IndicatorConfig[]> {
    const defaultConfigs: IndicatorConfig[] = [
      {
        id: 'sma_20',
        type: 'SMA',
        params: { period: 20 },
        pane: 'overlay',
        color: '#60a5fa',
        visible: true
      },
      {
        id: 'rsi_14',
        type: 'RSI',
        params: { period: 14 },
        pane: 'subpane',
        color: '#a78bfa',
        visible: true
      }
    ];
    return this.adapter.get<IndicatorConfig[]>(`indicators_${symbol}`, defaultConfigs);
  }

  public async saveIndicators(symbol: string, configs: IndicatorConfig[]): Promise<void> {
    await this.adapter.set(`indicators_${symbol}`, configs);
  }

  public async exportAll(): Promise<string> {
    const settings = await this.getSettings();
    const watchlists = await this.getWatchlists();
    return JSON.stringify({ settings, watchlists, version: 1, exportedAt: Date.now() }, null, 2);
  }

  public async importAll(jsonStr: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonStr);
      if (data.settings) await this.saveSettings(data.settings);
      if (data.watchlists) await this.saveWatchlists(data.watchlists);
      return true;
    } catch {
      return false;
    }
  }

  public async resetAll(): Promise<void> {
    await this.adapter.clear();
  }
}
