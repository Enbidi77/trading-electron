// Currency & Number Formatters

export function formatPrice(value: number, precision: number = 2): string {
  if (value === undefined || value === null || isNaN(value)) return '0.00';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  }).format(value);
}

export function formatCurrency(value: number, currency: string = 'USD', precision: number = 2): string {
  if (value === undefined || value === null || isNaN(value)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  }).format(value);
}

export function formatPercent(value: number, includeSign: boolean = true, precision: number = 2): string {
  if (value === undefined || value === null || isNaN(value)) return '0.00%';
  const prefix = includeSign && value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(precision)}%`;
}

export function formatCompactNumber(value: number): string {
  if (value === undefined || value === null || isNaN(value)) return '0';
  if (Math.abs(value) >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(2) + 'B';
  }
  if (Math.abs(value) >= 1_000_000) {
    return (value / 1_000_000).toFixed(2) + 'M';
  }
  if (Math.abs(value) >= 1_000) {
    return (value / 1_000).toFixed(2) + 'K';
  }
  return value.toFixed(2);
}

export function roundToTickSize(price: number, tickSize: number): number {
  if (tickSize <= 0) return price;
  const inv = 1 / tickSize;
  return Math.round(price * inv) / inv;
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

// Date & Time formatting

export function formatTime(timestampSeconds: number): string {
  const date = new Date(timestampSeconds * 1000);
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

export function formatDate(timestampSeconds: number): string {
  const date = new Date(timestampSeconds * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatDateTime(timestampSeconds: number): string {
  return `${formatDate(timestampSeconds)} ${formatTime(timestampSeconds)}`;
}

// Lightweight UUID / ID Generator

export function generateId(prefix: string = ''): string {
  const randomPart = Math.random().toString(36).substring(2, 9);
  const timePart = Date.now().toString(36);
  return prefix ? `${prefix}_${timePart}${randomPart}` : `${timePart}${randomPart}`;
}

// Lightweight Typed Event Emitter

type Listener<T> = (data: T) => void;

export class TypedEventEmitter<Events extends Record<string, any>> {
  private listeners: { [K in keyof Events]?: Array<Listener<Events[K]>> } = {};

  public on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);

    return () => {
      this.off(event, listener);
    };
  }

  public off<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
    const list = this.listeners[event];
    if (!list) return;
    this.listeners[event] = list.filter((l) => l !== listener);
  }

  public emit<K extends keyof Events>(event: K, data: Events[K]): void {
    const list = this.listeners[event];
    if (!list) return;
    for (const listener of list) {
      try {
        listener(data);
      } catch (err) {
        console.error(`Error in event listener for ${String(event)}:`, err);
      }
    }
  }

  public removeAllListeners(): void {
    this.listeners = {};
  }
}
