import type {
  AccountBalance,
  AlertItem,
  Candle,
  Instrument,
  LoginRequest,
  Order,
  Position,
  RegisterRequest,
  ScreenerFilter,
  ScreenerResult,
  Timeframe,
  User,
  UserSettings,
  Watchlist
} from '@trd/contracts';

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : endpoint;
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });

    const json = await res.json();
    if (!res.ok || json.success === false) {
      throw new Error(json.error || `HTTP error ${res.status}`);
    }

    return json.data !== undefined ? json.data : (json as T);
  }

  // Auth
  async login(credentials: LoginRequest): Promise<{ user: User }> {
    return this.request<{ user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async register(details: RegisterRequest): Promise<{ user: User }> {
    return this.request<{ user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(details)
    });
  }

  async getSession(): Promise<{ user: User; expiresAt: number } | null> {
    try {
      return await this.request<{ user: User; expiresAt: number }>('/api/auth/session');
    } catch {
      return null;
    }
  }

  async logout(): Promise<void> {
    await this.request('/api/auth/logout', { method: 'POST' });
  }

  // Market Data
  async getInstruments(): Promise<Instrument[]> {
    return this.request<Instrument[]>('/api/market-data/instruments');
  }

  async getCandles(symbol: string, timeframe: Timeframe, limit: number = 300): Promise<{ candles: Candle[] }> {
    return this.request<{ candles: Candle[] }>(
      `/api/market-data/candles?symbol=${encodeURIComponent(symbol)}&timeframe=${timeframe}&limit=${limit}`
    );
  }

  async getQuotes(): Promise<any[]> {
    return this.request<any[]>('/api/market-data/quotes');
  }

  // Trading
  async getAccount(): Promise<{ balance: AccountBalance; positions: Position[]; orders: Order[] }> {
    return this.request<{ balance: AccountBalance; positions: Position[]; orders: Order[] }>('/api/trading/account');
  }

  async placeOrder(order: any): Promise<Order> {
    return this.request<Order>('/api/trading/orders', {
      method: 'POST',
      body: JSON.stringify(order)
    });
  }

  async cancelOrder(orderId: string): Promise<void> {
    await this.request(`/api/trading/orders?id=${encodeURIComponent(orderId)}`, {
      method: 'DELETE'
    });
  }

  async closePosition(symbol: string): Promise<void> {
    await this.request('/api/trading/positions', {
      method: 'POST',
      body: JSON.stringify({ symbol })
    });
  }

  // Workspace
  async getSettings(): Promise<UserSettings> {
    return this.request<UserSettings>('/api/workspace?key=settings');
  }

  async saveSettings(settings: UserSettings): Promise<void> {
    await this.request('/api/workspace', {
      method: 'POST',
      body: JSON.stringify({ key: 'settings', value: settings })
    });
  }

  async getWatchlists(): Promise<Watchlist[]> {
    return this.request<Watchlist[]>('/api/workspace?key=watchlists');
  }

  async saveWatchlists(watchlists: Watchlist[]): Promise<void> {
    await this.request('/api/workspace', {
      method: 'POST',
      body: JSON.stringify({ key: 'watchlists', value: watchlists })
    });
  }

  // Screener & Alerts & Backtest
  async queryScreener(filter: ScreenerFilter): Promise<ScreenerResult[]> {
    const params = new URLSearchParams();
    if (filter.assetClass) params.set('assetClass', filter.assetClass);
    if (filter.minPrice) params.set('minPrice', filter.minPrice.toString());
    if (filter.maxPrice) params.set('maxPrice', filter.maxPrice.toString());
    if (filter.minChangePercent) params.set('minChangePercent', filter.minChangePercent.toString());
    if (filter.rsiCondition) params.set('rsiCondition', filter.rsiCondition);

    return this.request<ScreenerResult[]>(`/api/screener?${params.toString()}`);
  }

  async getAlerts(): Promise<AlertItem[]> {
    return this.request<AlertItem[]>('/api/alerts');
  }

  async createAlert(alert: Partial<AlertItem>): Promise<AlertItem> {
    return this.request<AlertItem>('/api/alerts', {
      method: 'POST',
      body: JSON.stringify(alert)
    });
  }

  async deleteAlert(id: string): Promise<void> {
    await this.request(`/api/alerts?id=${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  }

  async runBacktest(params: {
    symbol: string;
    timeframe: Timeframe;
    fastPeriod: number;
    slowPeriod: number;
  }): Promise<any> {
    return this.request('/api/backtest', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }
}

export const api = new ApiClient();

