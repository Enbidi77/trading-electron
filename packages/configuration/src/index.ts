import type { Timeframe } from '@trd/contracts';

export const TIMEFRAMES: { label: string; value: Timeframe }[] = [
  { label: '1s', value: '1s' },
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
  { label: '4h', value: '4h' },
  { label: '1D', value: '1D' },
  { label: '1W', value: '1W' }
];

export const APP_METADATA = {
  name: 'TRD Pro Terminal',
  version: '1.0.0',
  tagline: 'Professional High-Performance Liquid Glass Trading Terminal'
};
