import type {
  AccountBalance,
  Order,
  OrderSide,
  OrderStatus,
  OrderType,
  Position,
  TradeFill
} from '@trd/contracts';

export interface PlaceOrderRequest {
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  limitPrice?: number;
  stopPrice?: number;
  stopLossPrice?: number;
  takeProfitPrice?: number;
}

export interface IBrokerAdapter {
  readonly id: string;
  readonly name: string;
  getAccountBalance(): Promise<AccountBalance>;
  getPositions(): Promise<Position[]>;
  getOrders(): Promise<Order[]>;
  placeOrder(req: PlaceOrderRequest): Promise<Order>;
  cancelOrder(orderId: string): Promise<boolean>;
  closePosition(symbol: string): Promise<boolean>;
}

export function validateOrderRequest(req: PlaceOrderRequest): { valid: boolean; error?: string } {
  if (!req.symbol || req.symbol.trim() === '') {
    return { valid: false, error: 'Symbol is required' };
  }
  if (!req.quantity || req.quantity <= 0) {
    return { valid: false, error: 'Quantity must be greater than zero' };
  }
  if ((req.type === 'LIMIT' || req.type === 'STOP_LIMIT') && (!req.limitPrice || req.limitPrice <= 0)) {
    return { valid: false, error: 'Limit price must be greater than zero for Limit orders' };
  }
  if ((req.type === 'STOP' || req.type === 'STOP_LIMIT') && (!req.stopPrice || req.stopPrice <= 0)) {
    return { valid: false, error: 'Stop price must be greater than zero for Stop orders' };
  }
  return { valid: true };
}
