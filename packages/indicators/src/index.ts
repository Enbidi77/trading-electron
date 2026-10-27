import type { Candle } from '@trd/contracts';

export interface IndicatorPoint {
  time: number;
  value: number;
}

export interface BollingerBandsPoint {
  time: number;
  upper: number;
  middle: number;
  lower: number;
  bandwidth: number;
}

export interface MacdPoint {
  time: number;
  macd: number;
  signal: number;
  histogram: number;
}

export interface StochasticPoint {
  time: number;
  k: number;
  d: number;
}

export interface SupertrendPoint {
  time: number;
  value: number;
  direction: 1 | -1; // 1 = Bullish (uptrend), -1 = Bearish (downtrend)
}

// ==========================================
// Moving Averages: SMA, EMA, WMA, VWAP
// ==========================================

export function calculateSMA(candles: Candle[], period: number = 20): IndicatorPoint[] {
  if (candles.length < period) return [];
  const result: IndicatorPoint[] = [];

  let sum = 0;
  for (let i = 0; i < candles.length; i++) {
    sum += candles[i].close;
    if (i >= period) {
      sum -= candles[i - period].close;
    }
    if (i >= period - 1) {
      result.push({
        time: candles[i].time,
        value: Number((sum / period).toFixed(4))
      });
    }
  }
  return result;
}

export function calculateEMA(candles: Candle[], period: number = 20): IndicatorPoint[] {
  if (candles.length < period) return [];
  const result: IndicatorPoint[] = [];
  const multiplier = 2 / (period + 1);

  // Initial SMA as starting point
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += candles[i].close;
  }
  let prevEma = sum / period;
  result.push({
    time: candles[period - 1].time,
    value: Number(prevEma.toFixed(4))
  });

  for (let i = period; i < candles.length; i++) {
    const currentClose = candles[i].close;
    const currentEma = (currentClose - prevEma) * multiplier + prevEma;
    result.push({
      time: candles[i].time,
      value: Number(currentEma.toFixed(4))
    });
    prevEma = currentEma;
  }

  return result;
}

export function calculateWMA(candles: Candle[], period: number = 20): IndicatorPoint[] {
  if (candles.length < period) return [];
  const result: IndicatorPoint[] = [];
  const denominator = (period * (period + 1)) / 2;

  for (let i = period - 1; i < candles.length; i++) {
    let weightedSum = 0;
    for (let j = 0; j < period; j++) {
      const weight = j + 1;
      weightedSum += candles[i - period + 1 + j].close * weight;
    }
    result.push({
      time: candles[i].time,
      value: Number((weightedSum / denominator).toFixed(4))
    });
  }

  return result;
}

export function calculateVWAP(candles: Candle[]): IndicatorPoint[] {
  if (candles.length === 0) return [];
  const result: IndicatorPoint[] = [];

  let cumulativeTypicalVolume = 0;
  let cumulativeVolume = 0;

  for (let i = 0; i < candles.length; i++) {
    const c = candles[i];
    const typicalPrice = (c.high + c.low + c.close) / 3;
    const vol = c.volume > 0 ? c.volume : 1;

    cumulativeTypicalVolume += typicalPrice * vol;
    cumulativeVolume += vol;

    result.push({
      time: c.time,
      value: Number((cumulativeTypicalVolume / cumulativeVolume).toFixed(4))
    });
  }

  return result;
}

// ==========================================
// Bollinger Bands
// ==========================================

export function calculateBollingerBands(
  candles: Candle[],
  period: number = 20,
  stdDevMultiplier: number = 2
): BollingerBandsPoint[] {
  if (candles.length < period) return [];
  const result: BollingerBandsPoint[] = [];

  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += candles[i - j].close;
    }
    const middle = sum / period;

    let varianceSum = 0;
    for (let j = 0; j < period; j++) {
      varianceSum += Math.pow(candles[i - j].close - middle, 2);
    }
    const stdDev = Math.sqrt(varianceSum / period);

    const upper = middle + stdDevMultiplier * stdDev;
    const lower = middle - stdDevMultiplier * stdDev;
    const bandwidth = middle !== 0 ? ((upper - lower) / middle) * 100 : 0;

    result.push({
      time: candles[i].time,
      upper: Number(upper.toFixed(4)),
      middle: Number(middle.toFixed(4)),
      lower: Number(lower.toFixed(4)),
      bandwidth: Number(bandwidth.toFixed(2))
    });
  }

  return result;
}

// ==========================================
// ATR (Average True Range)
// ==========================================

export function calculateATR(candles: Candle[], period: number = 14): IndicatorPoint[] {
  if (candles.length < period + 1) return [];
  const trList: number[] = [];

  for (let i = 1; i < candles.length; i++) {
    const current = candles[i];
    const prev = candles[i - 1];
    const tr = Math.max(
      current.high - current.low,
      Math.abs(current.high - prev.close),
      Math.abs(current.low - prev.close)
    );
    trList.push(tr);
  }

  let atr = trList.slice(0, period).reduce((acc, v) => acc + v, 0) / period;
  const result: IndicatorPoint[] = [
    { time: candles[period].time, value: Number(atr.toFixed(4)) }
  ];

  for (let i = period; i < trList.length; i++) {
    atr = (atr * (period - 1) + trList[i]) / period;
    result.push({
      time: candles[i + 1].time,
      value: Number(atr.toFixed(4))
    });
  }

  return result;
}

// ==========================================
// RSI (Relative Strength Index)
// ==========================================

export function calculateRSI(candles: Candle[], period: number = 14): IndicatorPoint[] {
  if (candles.length <= period) return [];
  const result: IndicatorPoint[] = [];

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const change = candles[i].close - candles[i - 1].close;
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  const firstRS = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const firstRSI = avgLoss === 0 ? 100 : 100 - 100 / (1 + firstRS);
  result.push({
    time: candles[period].time,
    value: Number(firstRSI.toFixed(2))
  });

  for (let i = period + 1; i < candles.length; i++) {
    const change = candles[i].close - candles[i - 1].close;
    const currentGain = change > 0 ? change : 0;
    const currentLoss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + currentGain) / period;
    avgLoss = (avgLoss * (period - 1) + currentLoss) / period;

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + rs);

    result.push({
      time: candles[i].time,
      value: Number(rsi.toFixed(2))
    });
  }

  return result;
}

// ==========================================
// MACD (Moving Average Convergence Divergence)
// ==========================================

export function calculateMACD(
  candles: Candle[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MacdPoint[] {
  if (candles.length < slowPeriod + signalPeriod) return [];

  const fastEma = calculateEMA(candles, fastPeriod);
  const slowEma = calculateEMA(candles, slowPeriod);

  // Map by time
  const slowEmaMap = new Map(slowEma.map((p) => [p.time, p.value]));
  const macdLinePoints: IndicatorPoint[] = [];

  for (const fast of fastEma) {
    const slowVal = slowEmaMap.get(fast.time);
    if (slowVal !== undefined) {
      macdLinePoints.push({
        time: fast.time,
        value: fast.value - slowVal
      });
    }
  }

  if (macdLinePoints.length < signalPeriod) return [];

  // Calculate signal line (EMA of MACD line)
  const signalMultiplier = 2 / (signalPeriod + 1);
  let signalSum = 0;
  for (let i = 0; i < signalPeriod; i++) {
    signalSum += macdLinePoints[i].value;
  }
  let prevSignal = signalSum / signalPeriod;

  const result: MacdPoint[] = [];
  result.push({
    time: macdLinePoints[signalPeriod - 1].time,
    macd: Number(macdLinePoints[signalPeriod - 1].value.toFixed(4)),
    signal: Number(prevSignal.toFixed(4)),
    histogram: Number((macdLinePoints[signalPeriod - 1].value - prevSignal).toFixed(4))
  });

  for (let i = signalPeriod; i < macdLinePoints.length; i++) {
    const mVal = macdLinePoints[i].value;
    const currentSignal = (mVal - prevSignal) * signalMultiplier + prevSignal;
    const histogram = mVal - currentSignal;

    result.push({
      time: macdLinePoints[i].time,
      macd: Number(mVal.toFixed(4)),
      signal: Number(currentSignal.toFixed(4)),
      histogram: Number(histogram.toFixed(4))
    });
    prevSignal = currentSignal;
  }

  return result;
}

// ==========================================
// Stochastic Oscillator
// ==========================================

export function calculateStochastic(
  candles: Candle[],
  periodK: number = 14,
  smoothK: number = 3,
  periodD: number = 3
): StochasticPoint[] {
  if (candles.length < periodK) return [];

  const rawKList: IndicatorPoint[] = [];
  for (let i = periodK - 1; i < candles.length; i++) {
    let highestHigh = -Infinity;
    let lowestLow = Infinity;
    for (let j = 0; j < periodK; j++) {
      const c = candles[i - j];
      if (c.high > highestHigh) highestHigh = c.high;
      if (c.low < lowestLow) lowestLow = c.low;
    }

    const currentClose = candles[i].close;
    const range = highestHigh - lowestLow;
    const rawK = range === 0 ? 50 : ((currentClose - lowestLow) / range) * 100;
    rawKList.push({ time: candles[i].time, value: rawK });
  }

  if (rawKList.length < smoothK) return [];

  // Smooth %K
  const smoothedKList: IndicatorPoint[] = [];
  for (let i = smoothK - 1; i < rawKList.length; i++) {
    let sum = 0;
    for (let j = 0; j < smoothK; j++) {
      sum += rawKList[i - j].value;
    }
    smoothedKList.push({ time: rawKList[i].time, value: sum / smoothK });
  }

  // Calculate %D (SMA of smoothed %K)
  const result: StochasticPoint[] = [];
  for (let i = periodD - 1; i < smoothedKList.length; i++) {
    let sum = 0;
    for (let j = 0; j < periodD; j++) {
      sum += smoothedKList[i - j].value;
    }
    const dVal = sum / periodD;
    result.push({
      time: smoothedKList[i].time,
      k: Number(smoothedKList[i].value.toFixed(2)),
      d: Number(dVal.toFixed(2))
    });
  }

  return result;
}

// ==========================================
// Supertrend
// ==========================================

export function calculateSupertrend(
  candles: Candle[],
  atrPeriod: number = 10,
  multiplier: number = 3
): SupertrendPoint[] {
  if (candles.length < atrPeriod + 1) return [];

  const atrPoints = calculateATR(candles, atrPeriod);
  const atrMap = new Map(atrPoints.map((p) => [p.time, p.value]));

  const result: SupertrendPoint[] = [];
  let prevUpperBand = 0;
  let prevLowerBand = 0;
  let prevTrend: 1 | -1 = 1;
  let prevSupertrend = 0;

  for (let i = 0; i < candles.length; i++) {
    const c = candles[i];
    const atr = atrMap.get(c.time);
    if (!atr) continue;

    const hl2 = (c.high + c.low) / 2;
    let basicUpperBand = hl2 + multiplier * atr;
    let basicLowerBand = hl2 - multiplier * atr;

    const prevCandle = i > 0 ? candles[i - 1] : c;

    let upperBand = basicUpperBand;
    if (basicUpperBand < prevUpperBand || prevCandle.close > prevUpperBand) {
      upperBand = basicUpperBand;
    } else {
      upperBand = prevUpperBand;
    }

    let lowerBand = basicLowerBand;
    if (basicLowerBand > prevLowerBand || prevCandle.close < prevLowerBand) {
      lowerBand = basicLowerBand;
    } else {
      lowerBand = prevLowerBand;
    }

    let direction: 1 | -1 = prevTrend;
    let supertrendVal = 0;

    if (prevSupertrend === prevUpperBand) {
      direction = c.close > upperBand ? 1 : -1;
    } else {
      direction = c.close < lowerBand ? -1 : 1;
    }

    supertrendVal = direction === 1 ? lowerBand : upperBand;

    result.push({
      time: c.time,
      value: Number(supertrendVal.toFixed(4)),
      direction
    });

    prevUpperBand = upperBand;
    prevLowerBand = lowerBand;
    prevTrend = direction;
    prevSupertrend = supertrendVal;
  }

  return result;
}

// ==========================================
// OBV (On-Balance Volume)
// ==========================================

export function calculateOBV(candles: Candle[]): IndicatorPoint[] {
  if (candles.length === 0) return [];
  const result: IndicatorPoint[] = [];

  let obv = 0;
  result.push({ time: candles[0].time, value: obv });

  for (let i = 1; i < candles.length; i++) {
    const current = candles[i];
    const prev = candles[i - 1];

    if (current.close > prev.close) {
      obv += current.volume;
    } else if (current.close < prev.close) {
      obv -= current.volume;
    }

    result.push({
      time: current.time,
      value: obv
    });
  }

  return result;
}
