import type {
  AccountBalance,
  Order,
  Position,
  Tick,
  TradeFill
} from '@trd/contracts';
import { calculatePositionPnL } from '@trd/domain';
import { generateId, TypedEventEmitter } from '@trd/shared-utils';
import {
  type IBrokerAdapter,
  type PlaceOrderRequest,
  validateOrderRequest
} from '@trd/trading-engine';

export interface PaperBrokerEvents {
  orderUpdated: Order;
  orderFilled: { order: Order; fill: TradeFill };
  positionUpdated: Position;
  positionClosed: { symbol: string; realizedPnL: number };
  balanceUpdated: AccountBalance;
}

export class PaperBroker extends TypedEventEmitter<PaperBrokerEvents> implements IBrokerAdapter {
  readonly id = 'paper';
  readonly name = 'Paper Trading Account';

  private cash: number;
  private initialCash: number;
  private realizedPnL: number = 0;
  private feeRate: number = 0.0005; // 0.05%
  private orders: Map<string, Order> = new Map();
  private positions: Map<string, Position> = new Map();
  private latestPrices: Map<string, number> = new Map();

  constructor(initialCash: number = 100000) {
    super();
    this.cash = initialCash;
    this.initialCash = initialCash;
  }

  public async getAccountBalance(): Promise<AccountBalance> {
    let totalUnrealizedPnL = 0;
    let totalMarginUsed = 0;

    for (const pos of this.positions.values()) {
      totalUnrealizedPnL += pos.unrealizedPnL;
      totalMarginUsed += pos.marginUsed;
    }

    const equity = this.cash + totalUnrealizedPnL;
    const dailyPnL = totalUnrealizedPnL + this.realizedPnL;
    const dailyPnLPercent = this.initialCash > 0 ? (dailyPnL / this.initialCash) * 100 : 0;

    return {
      currency: 'USD',
      cash: Number(this.cash.toFixed(2)),
      equity: Number(equity.toFixed(2)),
      marginUsed: Number(totalMarginUsed.toFixed(2)),
      freeMargin: Number(Math.max(0, equity - totalMarginUsed).toFixed(2)),
      unrealizedPnL: Number(totalUnrealizedPnL.toFixed(2)),
      realizedPnL: Number(this.realizedPnL.toFixed(2)),
      dailyPnL: Number(dailyPnL.toFixed(2)),
      dailyPnLPercent: Number(dailyPnLPercent.toFixed(2))
    };
  }

  public async getPositions(): Promise<Position[]> {
    return Array.from(this.positions.values());
  }

  public async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  public async placeOrder(req: PlaceOrderRequest): Promise<Order> {
    const validation = validateOrderRequest(req);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid order parameters');
    }

    const currentPrice = this.latestPrices.get(req.symbol) || (req.limitPrice ? req.limitPrice : 100);
    const now = Math.floor(Date.now() / 1000);

    const order: Order = {
      id: generateId('ord'),
      clientOrderId: generateId('client'),
      symbol: req.symbol,
      side: req.side,
      type: req.type,
      quantity: req.quantity,
      filledQuantity: 0,
      limitPrice: req.limitPrice,
      stopPrice: req.stopPrice,
      timeInForce: 'GTC',
      status: 'OPEN',
      fee: 0,
      stopLossPrice: req.stopLossPrice,
      takeProfitPrice: req.takeProfitPrice,
      createdAt: now,
      updatedAt: now
    };

    this.orders.set(order.id, order);

    // If MARKET order, execute immediately
    if (order.type === 'MARKET') {
      const fillPrice = currentPrice;
      this.executeFill(order, fillPrice, order.quantity);
    }

    this.emit('orderUpdated', order);
    return order;
  }

  public async cancelOrder(orderId: string): Promise<boolean> {
    const order = this.orders.get(orderId);
    if (!order) return false;
    if (order.status !== 'OPEN' && order.status !== 'PENDING') return false;

    order.status = 'CANCELLED';
    order.updatedAt = Math.floor(Date.now() / 1000);
    this.emit('orderUpdated', order);
    return true;
  }

  public async closePosition(symbol: string): Promise<boolean> {
    const pos = this.positions.get(symbol);
    if (!pos) return false;

    const currentPrice = this.latestPrices.get(symbol) || pos.currentPrice;
    const closingSide = pos.side === 'LONG' ? 'SELL' : 'BUY';

    // Place market closing order
    await this.placeOrder({
      symbol,
      side: closingSide,
      type: 'MARKET',
      quantity: pos.quantity
    });

    return true;
  }

  /**
   * Evaluates pending orders and open position P&Ls against newly arrived market ticks
   */
  public onTick(tick: Tick): void {
    this.latestPrices.set(tick.symbol, tick.price);

    // 1. Update position unrealized P&L
    const pos = this.positions.get(tick.symbol);
    if (pos) {
      pos.currentPrice = tick.price;
      const { unrealizedPnL, unrealizedPnLPercent } = calculatePositionPnL(
        pos.side,
        pos.quantity,
        pos.avgEntryPrice,
        tick.price
      );
      pos.unrealizedPnL = Number(unrealizedPnL.toFixed(2));
      pos.unrealizedPnLPercent = Number(unrealizedPnLPercent.toFixed(2));
      pos.updatedAt = tick.timestamp;
      this.emit('positionUpdated', pos);

      // Check bracket SL/TP triggers
      if (pos.stopLossPrice) {
        const isTriggered =
          pos.side === 'LONG' ? tick.price <= pos.stopLossPrice : tick.price >= pos.stopLossPrice;
        if (isTriggered) {
          this.closePosition(pos.symbol);
          return;
        }
      }
      if (pos.takeProfitPrice) {
        const isTriggered =
          pos.side === 'LONG' ? tick.price >= pos.takeProfitPrice : tick.price <= pos.takeProfitPrice;
        if (isTriggered) {
          this.closePosition(pos.symbol);
          return;
        }
      }
    }

    // 2. Evaluate resting Limit / Stop orders
    for (const order of this.orders.values()) {
      if (order.symbol !== tick.symbol || order.status !== 'OPEN') continue;

      if (order.type === 'LIMIT' && order.limitPrice) {
        if (order.side === 'BUY' && tick.price <= order.limitPrice) {
          this.executeFill(order, order.limitPrice, order.quantity);
        } else if (order.side === 'SELL' && tick.price >= order.limitPrice) {
          this.executeFill(order, order.limitPrice, order.quantity);
        }
      } else if (order.type === 'STOP' && order.stopPrice) {
        if (order.side === 'BUY' && tick.price >= order.stopPrice) {
          this.executeFill(order, tick.price, order.quantity);
        } else if (order.side === 'SELL' && tick.price <= order.stopPrice) {
          this.executeFill(order, tick.price, order.quantity);
        }
      }
    }
  }

  private executeFill(order: Order, fillPrice: number, fillQuantity: number): void {
    const fee = fillPrice * fillQuantity * this.feeRate;
    order.status = 'FILLED';
    order.filledQuantity = fillQuantity;
    order.avgFillPrice = fillPrice;
    order.fee = fee;
    order.updatedAt = Math.floor(Date.now() / 1000);

    const fill: TradeFill = {
      id: generateId('fill'),
      orderId: order.id,
      symbol: order.symbol,
      side: order.side,
      price: fillPrice,
      quantity: fillQuantity,
      fee,
      timestamp: order.updatedAt
    };

    // Deduct fee from cash
    this.cash -= fee;

    // Position updates
    const existing = this.positions.get(order.symbol);

    if (!existing) {
      // Open new position
      const newPos: Position = {
        id: generateId('pos'),
        symbol: order.symbol,
        side: order.side === 'BUY' ? 'LONG' : 'SHORT',
        quantity: fillQuantity,
        avgEntryPrice: fillPrice,
        currentPrice: fillPrice,
        unrealizedPnL: 0,
        unrealizedPnLPercent: 0,
        realizedPnL: 0,
        stopLossPrice: order.stopLossPrice,
        takeProfitPrice: order.takeProfitPrice,
        marginUsed: fillPrice * fillQuantity,
        openedAt: order.updatedAt,
        updatedAt: order.updatedAt
      };
      this.positions.set(order.symbol, newPos);
      this.emit('positionUpdated', newPos);
    } else {
      // Position already exists
      const isSameSide =
        (existing.side === 'LONG' && order.side === 'BUY') ||
        (existing.side === 'SHORT' && order.side === 'SELL');

      if (isSameSide) {
        // Increase position size and re-average entry price
        const totalQty = existing.quantity + fillQuantity;
        const totalCost = existing.quantity * existing.avgEntryPrice + fillQuantity * fillPrice;
        existing.avgEntryPrice = totalCost / totalQty;
        existing.quantity = totalQty;
        existing.marginUsed = existing.quantity * existing.avgEntryPrice;
        existing.updatedAt = order.updatedAt;
        this.emit('positionUpdated', existing);
      } else {
        // Reducing or closing position
        if (fillQuantity >= existing.quantity) {
          // Completely closed
          const pnlResult = calculatePositionPnL(
            existing.side,
            existing.quantity,
            existing.avgEntryPrice,
            fillPrice
          );
          this.realizedPnL += pnlResult.unrealizedPnL;
          this.cash += pnlResult.unrealizedPnL;
          this.positions.delete(order.symbol);
          this.emit('positionClosed', { symbol: order.symbol, realizedPnL: pnlResult.unrealizedPnL });
        } else {
          // Partially reduced
          const pnlResult = calculatePositionPnL(
            existing.side,
            fillQuantity,
            existing.avgEntryPrice,
            fillPrice
          );
          this.realizedPnL += pnlResult.unrealizedPnL;
          this.cash += pnlResult.unrealizedPnL;
          existing.quantity -= fillQuantity;
          existing.marginUsed = existing.quantity * existing.avgEntryPrice;
          existing.updatedAt = order.updatedAt;
          this.emit('positionUpdated', existing);
        }
      }
    }

    this.emit('orderFilled', { order, fill });
    this.emit('orderUpdated', order);

    this.getAccountBalance().then((bal) => this.emit('balanceUpdated', bal));
  }
}
