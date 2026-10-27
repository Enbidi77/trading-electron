import { create } from 'zustand';
import type {
  AccountBalance,
  ChartDrawing,
  ChartLayoutType,
  DrawingType,
  IndicatorConfig,
  Instrument,
  Order,
  OrderBook,
  Position,
  Tick,
  TimeAndSalesTrade,
  Timeframe,
  UserSettings,
  Watchlist
} from '@trd/contracts';
import {
  DEFAULT_INSTRUMENTS,
  SimulatedMarketDataProvider
} from '@trd/market-data-providers';
import { PaperBroker } from '@trd/paper-trading';
import {
  DEFAULT_USER_SETTINGS,
  DEFAULT_WATCHLISTS,
  WorkspacePersistenceService
} from '@trd/persistence';

export type TerminalViewTab =
  | 'terminal'
  | 'watchlist'
  | 'screener'
  | 'portfolio'
  | 'papertrading'
  | 'risk'
  | 'backtest'
  | 'alerts'
  | 'calendar'
  | 'news'
  | 'journal'
  | 'settings';

interface TerminalState {
  // Settings & Navigation
  settings: UserSettings;
  activeView: TerminalViewTab;
  commandPaletteOpen: boolean;
  riskModalOpen: boolean;

  // Market Data
  instruments: Instrument[];
  activeSymbol: string;
  activeTimeframe: Timeframe;
  chartLayout: ChartLayoutType;
  providerStatus: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED';
  marketProvider: SimulatedMarketDataProvider;
  latestTicks: Record<string, Tick>;
  activeOrderBook: OrderBook | null;
  recentTrades: TimeAndSalesTrade[];

  // Watchlists
  watchlists: Watchlist[];
  activeWatchlistId: string;

  // Chart Drawings & Indicators
  activeDrawingTool: DrawingType | null;
  drawings: ChartDrawing[];
  indicators: IndicatorConfig[];

  // Paper Trading & Portfolio
  paperBroker: PaperBroker;
  balance: AccountBalance;
  positions: Position[];
  orders: Order[];

  // Actions
  init: () => Promise<void>;
  setActiveView: (view: TerminalViewTab) => void;
  setActiveSymbol: (symbol: string) => void;
  setActiveTimeframe: (tf: Timeframe) => void;
  setChartLayout: (layout: ChartLayoutType) => void;
  toggleTheme: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setRiskModalOpen: (open: boolean) => void;
  setActiveDrawingTool: (tool: DrawingType | null) => void;
  addDrawing: (drawing: ChartDrawing) => void;
  deleteDrawing: (id: string) => void;
  toggleIndicator: (type: string) => void;
  placeOrder: (req: any) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  closePosition: (symbol: string) => Promise<void>;
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
}

const persistence = new WorkspacePersistenceService();
const provider = new SimulatedMarketDataProvider();
const broker = new PaperBroker(100000);

export const useTerminalStore = create<TerminalState>((set, get) => ({
  settings: DEFAULT_USER_SETTINGS,
  activeView: 'terminal',
  commandPaletteOpen: false,
  riskModalOpen: false,

  instruments: DEFAULT_INSTRUMENTS,
  activeSymbol: 'BTC/USD',
  activeTimeframe: '15m',
  chartLayout: '1x1',
  providerStatus: 'DISCONNECTED',
  marketProvider: provider,
  latestTicks: {},
  activeOrderBook: null,
  recentTrades: [],

  watchlists: DEFAULT_WATCHLISTS,
  activeWatchlistId: 'default',

  activeDrawingTool: null,
  drawings: [],
  indicators: [
    {
      id: 'sma_20',
      type: 'SMA',
      params: { period: 20 },
      pane: 'overlay',
      color: '#38bdf8',
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
  ],

  paperBroker: broker,
  balance: {
    currency: 'USD',
    cash: 100000,
    equity: 100000,
    marginUsed: 0,
    freeMargin: 100000,
    unrealizedPnL: 0,
    realizedPnL: 0,
    dailyPnL: 0,
    dailyPnLPercent: 0
  },
  positions: [],
  orders: [],

  init: async () => {
    // 1. Load saved settings and watchlists
    const settings = await persistence.getSettings();
    const watchlists = await persistence.getWatchlists();
    const savedDrawings = await persistence.getDrawings(settings.activeSymbol);
    const initialBal = await broker.getAccountBalance();

    set({
      settings,
      activeSymbol: settings.activeSymbol,
      activeTimeframe: settings.activeTimeframe,
      chartLayout: settings.chartLayout,
      watchlists,
      drawings: savedDrawings,
      balance: initialBal
    });

    // 2. Connect Market Data Provider
    await provider.connect();
    const instruments = await provider.getInstruments();
    set({ instruments, providerStatus: 'CONNECTED' });

    // 3. Subscribe to active symbol ticks, book, and trades
    const subscribeSymbolData = (symbol: string) => {
      provider.subscribeTicks(symbol, (tick) => {
        // Feed tick to PaperBroker for real-time order matching and PnL updates
        broker.onTick(tick);

        set((state) => ({
          latestTicks: {
            ...state.latestTicks,
            [tick.symbol]: tick
          }
        }));
      });

      provider.subscribeOrderBook(symbol, (book) => {
        set({ activeOrderBook: book });
      });

      provider.subscribeTrades(symbol, (trade) => {
        set((state) => ({
          recentTrades: [trade, ...state.recentTrades.slice(0, 49)]
        }));
      });
    };

    subscribeSymbolData(settings.activeSymbol);

    // Also subscribe to all instruments in watchlist for real-time tickers
    for (const inst of instruments) {
      if (inst.symbol !== settings.activeSymbol) {
        provider.subscribeTicks(inst.symbol, (tick) => {
          set((state) => ({
            latestTicks: {
              ...state.latestTicks,
              [tick.symbol]: tick
            }
          }));
        });
      }
    }

    // 4. Bind Paper Broker events
    broker.on('balanceUpdated', (bal) => {
      set({ balance: bal });
    });

    broker.on('positionUpdated', async () => {
      const positions = await broker.getPositions();
      const bal = await broker.getAccountBalance();
      set({ positions, balance: bal });
    });

    broker.on('positionClosed', async () => {
      const positions = await broker.getPositions();
      const bal = await broker.getAccountBalance();
      set({ positions, balance: bal });
    });

    broker.on('orderUpdated', async () => {
      const orders = await broker.getOrders();
      set({ orders });
    });
  },

  setActiveView: (view: TerminalViewTab) => {
    set({ activeView: view });
  },

  setActiveSymbol: async (symbol: string) => {
    const { settings, marketProvider } = get();
    const updatedSettings = { ...settings, activeSymbol: symbol };
    await persistence.saveSettings(updatedSettings);
    const savedDrawings = await persistence.getDrawings(symbol);

    set({
      activeSymbol: symbol,
      settings: updatedSettings,
      drawings: savedDrawings,
      recentTrades: []
    });

    // Subscribe to new symbol
    marketProvider.subscribeOrderBook(symbol, (book) => {
      set({ activeOrderBook: book });
    });

    marketProvider.subscribeTrades(symbol, (trade) => {
      set((state) => ({
        recentTrades: [trade, ...state.recentTrades.slice(0, 49)]
      }));
    });
  },

  setActiveTimeframe: async (tf: Timeframe) => {
    const { settings } = get();
    const updated = { ...settings, activeTimeframe: tf };
    await persistence.saveSettings(updated);
    set({ activeTimeframe: tf, settings: updated });
  },

  setChartLayout: async (layout: ChartLayoutType) => {
    const { settings } = get();
    const updated = { ...settings, chartLayout: layout };
    await persistence.saveSettings(updated);
    set({ chartLayout: layout, settings: updated });
  },

  toggleTheme: async () => {
    const { settings } = get();
    const newTheme: 'dark' | 'light' = settings.theme === 'dark' ? 'light' : 'dark';
    const updated: UserSettings = { ...settings, theme: newTheme };
    await persistence.saveSettings(updated);

    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    set({ settings: updated });
  },

  setCommandPaletteOpen: (open: boolean) => set({ commandPaletteOpen: open }),
  setRiskModalOpen: (open: boolean) => set({ riskModalOpen: open }),

  setActiveDrawingTool: (tool: DrawingType | null) => {
    set({ activeDrawingTool: tool });
  },

  addDrawing: async (drawing: ChartDrawing) => {
    const { drawings, activeSymbol } = get();
    const updated = [...drawings, drawing];
    set({ drawings: updated });
    await persistence.saveDrawings(activeSymbol, updated);
  },

  deleteDrawing: async (id: string) => {
    const { drawings, activeSymbol } = get();
    const updated = drawings.filter((d) => d.id !== id);
    set({ drawings: updated });
    await persistence.saveDrawings(activeSymbol, updated);
  },

  toggleIndicator: (type: string) => {
    set((state) => {
      const exists = state.indicators.find((ind) => ind.type === type);
      if (exists) {
        return {
          indicators: state.indicators.filter((ind) => ind.type !== type)
        };
      } else {
        const newInd: IndicatorConfig = {
          id: `${type.toLowerCase()}_${Date.now()}`,
          type: type as any,
          params: type === 'SMA' ? { period: 50 } : { period: 14 },
          pane: type === 'RSI' || type === 'MACD' ? 'subpane' : 'overlay',
          color: '#34d399',
          visible: true
        };
        return { indicators: [...state.indicators, newInd] };
      }
    });
  },

  placeOrder: async (req: any) => {
    const { paperBroker } = get();
    await paperBroker.placeOrder(req);
    const orders = await paperBroker.getOrders();
    const positions = await paperBroker.getPositions();
    const bal = await paperBroker.getAccountBalance();
    set({ orders, positions, balance: bal });
  },

  cancelOrder: async (orderId: string) => {
    const { paperBroker } = get();
    await paperBroker.cancelOrder(orderId);
    const orders = await paperBroker.getOrders();
    set({ orders });
  },

  closePosition: async (symbol: string) => {
    const { paperBroker } = get();
    await paperBroker.closePosition(symbol);
    const positions = await paperBroker.getPositions();
    const bal = await paperBroker.getAccountBalance();
    set({ positions, balance: bal });
  },

  addToWatchlist: async (symbol: string) => {
    const { watchlists, activeWatchlistId } = get();
    const updated = watchlists.map((w) => {
      if (w.id === activeWatchlistId && !w.symbols.includes(symbol)) {
        return { ...w, symbols: [...w.symbols, symbol] };
      }
      return w;
    });
    set({ watchlists: updated });
    await persistence.saveWatchlists(updated);
  },

  removeFromWatchlist: async (symbol: string) => {
    const { watchlists, activeWatchlistId } = get();
    const updated = watchlists.map((w) => {
      if (w.id === activeWatchlistId) {
        return { ...w, symbols: w.symbols.filter((s) => s !== symbol) };
      }
      return w;
    });
    set({ watchlists: updated });
    await persistence.saveWatchlists(updated);
  }
}));
