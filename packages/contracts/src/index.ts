import { z } from 'zod';

// ==========================================
// Market Data Contracts
// ==========================================

export const AssetClassSchema = z.enum(['crypto', 'equity', 'forex', 'commodity', 'index']);
export type AssetClass = z.infer<typeof AssetClassSchema>;

export const InstrumentSchema = z.object({
  symbol: z.string(),
  name: z.string(),
  assetClass: AssetClassSchema,
  baseCurrency: z.string(),
  quoteCurrency: z.string(),
  pricePrecision: z.number().int().min(0).max(8),
  quantityPrecision: z.number().int().min(0).max(8),
  tickSize: z.number().positive(),
  minOrderQty: z.number().positive(),
  maxOrderQty: z.number().positive().optional(),
  lotSize: z.number().positive().default(1),
  contractMultiplier: z.number().positive().default(1),
  description: z.string().optional(),
  exchange: z.string().default('DEMO')
});
export type Instrument = z.infer<typeof InstrumentSchema>;

export const TimeframeSchema = z.enum([
  '1s',
  '1m',
  '3m',
  '5m',
  '15m',
  '30m',
  '1h',
  '2h',
  '4h',
  '1D',
  '1W'
]);
export type Timeframe = z.infer<typeof TimeframeSchema>;

export const CandleSchema = z.object({
  time: z.number().describe('Unix timestamp in seconds'),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number()
});
export type Candle = z.infer<typeof CandleSchema>;

export const TickSchema = z.object({
  symbol: z.string(),
  price: z.number(),
  size: z.number(),
  timestamp: z.number(),
  side: z.enum(['buy', 'sell']).optional()
});
export type Tick = z.infer<typeof TickSchema>;

export const OrderBookLevelSchema = z.object({
  price: z.number(),
  size: z.number(),
  total: z.number()
});
export type OrderBookLevel = z.infer<typeof OrderBookLevelSchema>;

export const OrderBookSchema = z.object({
  symbol: z.string(),
  timestamp: z.number(),
  bids: z.array(OrderBookLevelSchema),
  asks: z.array(OrderBookLevelSchema)
});
export type OrderBook = z.infer<typeof OrderBookSchema>;

export const TimeAndSalesTradeSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  timestamp: z.number(),
  price: z.number(),
  size: z.number(),
  side: z.enum(['buy', 'sell'])
});
export type TimeAndSalesTrade = z.infer<typeof TimeAndSalesTradeSchema>;

// ==========================================
// Trading & Order Execution Contracts
// ==========================================

export const OrderSideSchema = z.enum(['BUY', 'SELL']);
export type OrderSide = z.infer<typeof OrderSideSchema>;

export const OrderTypeSchema = z.enum(['MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT']);
export type OrderType = z.infer<typeof OrderTypeSchema>;

export const TimeInForceSchema = z.enum(['GTC', 'IOC', 'DAY']);
export type TimeInForce = z.infer<typeof TimeInForceSchema>;

export const OrderStatusSchema = z.enum([
  'PENDING',
  'OPEN',
  'FILLED',
  'PARTIALLY_FILLED',
  'CANCELLED',
  'REJECTED'
]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const OrderSchema = z.object({
  id: z.string(),
  clientOrderId: z.string(),
  symbol: z.string(),
  side: OrderSideSchema,
  type: OrderTypeSchema,
  quantity: z.number().positive(),
  filledQuantity: z.number().nonnegative().default(0),
  limitPrice: z.number().positive().optional(),
  stopPrice: z.number().positive().optional(),
  timeInForce: TimeInForceSchema.default('GTC'),
  status: OrderStatusSchema,
  stopLossPrice: z.number().positive().optional(),
  takeProfitPrice: z.number().positive().optional(),
  avgFillPrice: z.number().optional(),
  fee: z.number().nonnegative().default(0),
  createdAt: z.number(),
  updatedAt: z.number(),
  rejectionReason: z.string().optional()
});
export type Order = z.infer<typeof OrderSchema>;

export const PositionSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  side: z.enum(['LONG', 'SHORT']),
  quantity: z.number().positive(),
  avgEntryPrice: z.number().positive(),
  currentPrice: z.number().positive(),
  unrealizedPnL: z.number(),
  unrealizedPnLPercent: z.number(),
  realizedPnL: z.number(),
  stopLossPrice: z.number().positive().optional(),
  takeProfitPrice: z.number().positive().optional(),
  marginUsed: z.number().nonnegative(),
  openedAt: z.number(),
  updatedAt: z.number()
});
export type Position = z.infer<typeof PositionSchema>;

export const AccountBalanceSchema = z.object({
  currency: z.string().default('USD'),
  cash: z.number(),
  equity: z.number(),
  marginUsed: z.number(),
  freeMargin: z.number(),
  unrealizedPnL: z.number(),
  realizedPnL: z.number(),
  dailyPnL: z.number(),
  dailyPnLPercent: z.number()
});
export type AccountBalance = z.infer<typeof AccountBalanceSchema>;

export const TradeFillSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  symbol: z.string(),
  side: OrderSideSchema,
  price: z.number().positive(),
  quantity: z.number().positive(),
  fee: z.number().nonnegative(),
  timestamp: z.number()
});
export type TradeFill = z.infer<typeof TradeFillSchema>;

// ==========================================
// Chart Drawings & Indicators Contracts
// ==========================================

export const DrawingTypeSchema = z.enum([
  'trendline',
  'horizontal_line',
  'vertical_line',
  'ray',
  'fibonacci',
  'rectangle',
  'risk_reward_long',
  'risk_reward_short',
  'text'
]);
export type DrawingType = z.infer<typeof DrawingTypeSchema>;

export const DrawingPointSchema = z.object({
  time: z.number(),
  price: z.number()
});
export type DrawingPoint = z.infer<typeof DrawingPointSchema>;

export const DrawingStyleSchema = z.object({
  color: z.string().default('#3b82f6'),
  lineWidth: z.number().min(1).max(10).default(2),
  lineStyle: z.enum(['solid', 'dashed', 'dotted']).default('solid'),
  fillColor: z.string().optional(),
  fontSize: z.number().optional(),
  text: z.string().optional()
});
export type DrawingStyle = z.infer<typeof DrawingStyleSchema>;

export const ChartDrawingSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  timeframe: TimeframeSchema.optional(),
  type: DrawingTypeSchema,
  points: z.array(DrawingPointSchema),
  style: DrawingStyleSchema,
  locked: z.boolean().default(false),
  visible: z.boolean().default(true),
  riskRewardMeta: z.object({
    entryPrice: z.number(),
    stopLoss: z.number(),
    takeProfit: z.number(),
    ratio: z.number()
  }).optional()
});
export type ChartDrawing = z.infer<typeof ChartDrawingSchema>;

export const IndicatorTypeSchema = z.enum([
  'SMA',
  'EMA',
  'WMA',
  'VWAP',
  'RSI',
  'MACD',
  'BB',
  'STOCH',
  'ATR',
  'OBV',
  'SUPERTREND'
]);
export type IndicatorType = z.infer<typeof IndicatorTypeSchema>;

export const IndicatorConfigSchema = z.object({
  id: z.string(),
  type: IndicatorTypeSchema,
  params: z.record(z.string(), z.number()),
  pane: z.enum(['overlay', 'subpane']).default('overlay'),
  color: z.string().default('#60a5fa'),
  visible: z.boolean().default(true)
});
export type IndicatorConfig = z.infer<typeof IndicatorConfigSchema>;

// ==========================================
// Alerts & Screener Contracts
// ==========================================

export const AlertConditionTypeSchema = z.enum([
  'PRICE_CROSS_ABOVE',
  'PRICE_CROSS_BELOW',
  'INDICATOR_CROSS',
  'PCT_CHANGE_ABOVE',
  'PCT_CHANGE_BELOW'
]);
export type AlertConditionType = z.infer<typeof AlertConditionTypeSchema>;

export const AlertItemSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  conditionType: AlertConditionTypeSchema,
  thresholdPrice: z.number().optional(),
  percentThreshold: z.number().optional(),
  active: z.boolean().default(true),
  createdAt: z.number(),
  triggeredAt: z.number().optional(),
  notes: z.string().optional()
});
export type AlertItem = z.infer<typeof AlertItemSchema>;

export const ScreenerFilterSchema = z.object({
  assetClass: AssetClassSchema.optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  minChangePercent: z.number().optional(),
  maxChangePercent: z.number().optional(),
  minVolume: z.number().optional(),
  rsiCondition: z.enum(['oversold', 'overbought', 'any']).optional()
});
export type ScreenerFilter = z.infer<typeof ScreenerFilterSchema>;

export const ScreenerResultSchema = z.object({
  symbol: z.string(),
  name: z.string(),
  price: z.number(),
  change24h: z.number(),
  changePercent24h: z.number(),
  volume24h: z.number(),
  high24h: z.number(),
  low24h: z.number(),
  rsi: z.number().optional(),
  sma20: z.number().optional(),
  sma50: z.number().optional()
});
export type ScreenerResult = z.infer<typeof ScreenerResultSchema>;

// ==========================================
// Workspace & User Settings Contracts
// ==========================================

export const ChartLayoutTypeSchema = z.enum(['1x1', '1x2', '2x1', '2x2']);
export type ChartLayoutType = z.infer<typeof ChartLayoutTypeSchema>;

export const UserSettingsSchema = z.object({
  theme: z.enum(['dark', 'light', 'system']).default('dark'),
  activeSymbol: z.string().default('BTC/USD'),
  activeTimeframe: TimeframeSchema.default('15m'),
  chartLayout: ChartLayoutTypeSchema.default('1x1'),
  activeWatchlistId: z.string().default('default'),
  defaultOrderQuantity: z.number().default(1),
  paperTradingInitialBalance: z.number().default(100000),
  soundEnabled: z.boolean().default(true),
  chartSyncCrosshair: z.boolean().default(true),
  chartSyncTimeframe: z.boolean().default(false)
});
export type UserSettings = z.infer<typeof UserSettingsSchema>;

export const WatchlistSchema = z.object({
  id: z.string(),
  name: z.string(),
  symbols: z.array(z.string())
});
export type Watchlist = z.infer<typeof WatchlistSchema>;
