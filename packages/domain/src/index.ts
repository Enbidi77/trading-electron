import type { Candle, Instrument, Order, Position } from '@trd/contracts';
import { roundToTickSize } from '@trd/shared-utils';

// ==========================================
// Order & Execution Domain Rules
// ==========================================

export interface OrderCostEstimate {
  notionalValue: number;
  estimatedFee: number;
  requiredMargin: number;
}

export function estimateOrderCost(
  quantity: number,
  price: number,
  feeRate: number = 0.001, // 0.1% default
  leverage: number = 1
): OrderCostEstimate {
  const notionalValue = quantity * price;
  const estimatedFee = notionalValue * feeRate;
  const requiredMargin = notionalValue / leverage;
  return {
    notionalValue,
    estimatedFee,
    requiredMargin
  };
}

// ==========================================
// Position & PnL Calculations
// ==========================================

export function calculatePositionPnL(
  side: 'LONG' | 'SHORT',
  quantity: number,
  entryPrice: number,
  currentPrice: number
): { unrealizedPnL: number; unrealizedPnLPercent: number } {
  let unrealizedPnL = 0;
  if (side === 'LONG') {
    unrealizedPnL = (currentPrice - entryPrice) * quantity;
  } else {
    unrealizedPnL = (entryPrice - currentPrice) * quantity;
  }

  const costBasis = entryPrice * quantity;
  const unrealizedPnLPercent = costBasis > 0 ? (unrealizedPnL / costBasis) * 100 : 0;

  return {
    unrealizedPnL,
    unrealizedPnLPercent
  };
}

// ==========================================
// Risk Management Calculations
// ==========================================

export interface PositionSizeResult {
  maxRiskAmount: number;
  positionQuantity: number;
  notionalValue: number;
  riskRewardRatio: number;
  isValid: boolean;
  validationError?: string;
}

export function calculatePositionSize(params: {
  accountEquity: number;
  riskPercent: number; // e.g. 1%
  entryPrice: number;
  stopLossPrice: number;
  takeProfitPrice?: number;
  instrument: Instrument;
}): PositionSizeResult {
  const { accountEquity, riskPercent, entryPrice, stopLossPrice, takeProfitPrice, instrument } = params;

  if (accountEquity <= 0) {
    return { maxRiskAmount: 0, positionQuantity: 0, notionalValue: 0, riskRewardRatio: 0, isValid: false, validationError: 'Account equity must be positive' };
  }
  if (entryPrice <= 0 || stopLossPrice <= 0) {
    return { maxRiskAmount: 0, positionQuantity: 0, notionalValue: 0, riskRewardRatio: 0, isValid: false, validationError: 'Prices must be greater than zero' };
  }

  const priceRiskPerUnit = Math.abs(entryPrice - stopLossPrice);
  if (priceRiskPerUnit === 0) {
    return { maxRiskAmount: 0, positionQuantity: 0, notionalValue: 0, riskRewardRatio: 0, isValid: false, validationError: 'Stop loss cannot equal entry price' };
  }

  const maxRiskAmount = accountEquity * (riskPercent / 100);
  let rawQuantity = maxRiskAmount / priceRiskPerUnit;

  // Step quantity by lot size / precision
  const step = instrument.lotSize || 1;
  let steppedQuantity = Math.floor(rawQuantity / step) * step;
  if (instrument.quantityPrecision > 0) {
    steppedQuantity = Number(steppedQuantity.toFixed(instrument.quantityPrecision));
  } else {
    steppedQuantity = Math.floor(steppedQuantity);
  }

  if (steppedQuantity < instrument.minOrderQty) {
    return {
      maxRiskAmount,
      positionQuantity: 0,
      notionalValue: 0,
      riskRewardRatio: 0,
      isValid: false,
      validationError: `Calculated size (${steppedQuantity}) is below minimum order size (${instrument.minOrderQty})`
    };
  }

  const notionalValue = steppedQuantity * entryPrice;
  let riskRewardRatio = 0;
  if (takeProfitPrice && takeProfitPrice > 0) {
    const profitPerUnit = Math.abs(takeProfitPrice - entryPrice);
    riskRewardRatio = Number((profitPerUnit / priceRiskPerUnit).toFixed(2));
  }

  return {
    maxRiskAmount,
    positionQuantity: steppedQuantity,
    notionalValue,
    riskRewardRatio,
    isValid: true
  };
}

// ==========================================
// Specialized Candle Transformations
// ==========================================

export function computeHeikinAshi(candles: Candle[]): Candle[] {
  if (candles.length === 0) return [];

  const result: Candle[] = [];
  let prevHaOpen = candles[0].open;
  let prevHaClose = candles[0].close;

  for (let i = 0; i < candles.length; i++) {
    const c = candles[i];
    const haClose = (c.open + c.high + c.low + c.close) / 4;
    const haOpen = i === 0 ? (c.open + c.close) / 2 : (prevHaOpen + prevHaClose) / 2;
    const haHigh = Math.max(c.high, haOpen, haClose);
    const haLow = Math.min(c.low, haOpen, haClose);

    result.push({
      time: c.time,
      open: haOpen,
      high: haHigh,
      low: haLow,
      close: haClose,
      volume: c.volume
    });

    prevHaOpen = haOpen;
    prevHaClose = haClose;
  }

  return result;
}

export function computePivotPoints(high: number, low: number, close: number) {
  const pp = (high + low + close) / 3;
  return {
    pp,
    r1: 2 * pp - low,
    s1: 2 * pp - high,
    r2: pp + (high - low),
    s2: pp - (high - low),
    r3: high + 2 * (pp - low),
    s3: low - 2 * (high - pp)
  };
}
