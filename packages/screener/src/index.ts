import type { Instrument, ScreenerFilter, ScreenerResult } from '@trd/contracts';

export function screenInstruments(
  instruments: Instrument[],
  results: ScreenerResult[],
  filter: ScreenerFilter
): ScreenerResult[] {
  const instMap = new Map(instruments.map((i) => [i.symbol, i]));

  return results.filter((res) => {
    const inst = instMap.get(res.symbol);
    if (filter.assetClass && inst && inst.assetClass !== filter.assetClass) {
      return false;
    }
    if (filter.minPrice !== undefined && res.price < filter.minPrice) {
      return false;
    }
    if (filter.maxPrice !== undefined && res.price > filter.maxPrice) {
      return false;
    }
    if (filter.minChangePercent !== undefined && res.changePercent24h < filter.minChangePercent) {
      return false;
    }
    if (filter.maxChangePercent !== undefined && res.changePercent24h > filter.maxChangePercent) {
      return false;
    }
    if (filter.minVolume !== undefined && res.volume24h < filter.minVolume) {
      return false;
    }
    if (filter.rsiCondition) {
      if (filter.rsiCondition === 'oversold' && (res.rsi === undefined || res.rsi > 30)) {
        return false;
      }
      if (filter.rsiCondition === 'overbought' && (res.rsi === undefined || res.rsi < 70)) {
        return false;
      }
    }
    return true;
  });
}
