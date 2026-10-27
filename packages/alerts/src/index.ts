import type { AlertItem, Tick } from '@trd/contracts';
import { generateId, TypedEventEmitter } from '@trd/shared-utils';

export interface AlertEngineEvents {
  alertTriggered: { alert: AlertItem; currentPrice: number; message: string };
  alertCreated: AlertItem;
  alertRemoved: string;
}

export class AlertEngine extends TypedEventEmitter<AlertEngineEvents> {
  private alerts: Map<string, AlertItem> = new Map();
  private lastPrices: Map<string, number> = new Map();

  public addAlert(alertData: Omit<AlertItem, 'id' | 'createdAt' | 'active'>): AlertItem {
    const alert: AlertItem = {
      ...alertData,
      id: generateId('alt'),
      createdAt: Math.floor(Date.now() / 1000),
      active: true
    };
    this.alerts.set(alert.id, alert);
    this.emit('alertCreated', alert);
    return alert;
  }

  public removeAlert(id: string): boolean {
    const deleted = this.alerts.delete(id);
    if (deleted) {
      this.emit('alertRemoved', id);
    }
    return deleted;
  }

  public getAlerts(): AlertItem[] {
    return Array.from(this.alerts.values());
  }

  public processTick(tick: Tick): void {
    const prevPrice = this.lastPrices.get(tick.symbol);
    this.lastPrices.set(tick.symbol, tick.price);

    if (prevPrice === undefined) return;

    for (const alert of this.alerts.values()) {
      if (!alert.active || alert.symbol !== tick.symbol) continue;

      let triggered = false;
      let message = '';

      if (alert.conditionType === 'PRICE_CROSS_ABOVE' && alert.thresholdPrice !== undefined) {
        if (prevPrice < alert.thresholdPrice && tick.price >= alert.thresholdPrice) {
          triggered = true;
          message = `${alert.symbol} crossed above ${alert.thresholdPrice}`;
        }
      } else if (alert.conditionType === 'PRICE_CROSS_BELOW' && alert.thresholdPrice !== undefined) {
        if (prevPrice > alert.thresholdPrice && tick.price <= alert.thresholdPrice) {
          triggered = true;
          message = `${alert.symbol} crossed below ${alert.thresholdPrice}`;
        }
      }

      if (triggered) {
        alert.active = false;
        alert.triggeredAt = Math.floor(Date.now() / 1000);
        this.emit('alertTriggered', {
          alert,
          currentPrice: tick.price,
          message: alert.notes ? `${message} (${alert.notes})` : message
        });
      }
    }
  }
}
