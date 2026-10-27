import type { Instrument, Position } from '@trd/contracts';
import { calculatePositionSize, type PositionSizeResult } from '@trd/domain';

export { calculatePositionSize, type PositionSizeResult };

export interface PortfolioRiskMetrics {
  totalEquity: number;
  totalMarginUsed: number;
  marginUtilizationPercent: number;
  largestPositionSymbol: string | null;
  largestPositionPercent: number;
  riskRewardAverage: number;
}

export function evaluatePortfolioRisk(
  totalEquity: number,
  positions: Position[]
): PortfolioRiskMetrics {
  if (totalEquity <= 0 || positions.length === 0) {
    return {
      totalEquity,
      totalMarginUsed: 0,
      marginUtilizationPercent: 0,
      largestPositionSymbol: null,
      largestPositionPercent: 0,
      riskRewardAverage: 0
    };
  }

  let totalMarginUsed = 0;
  let largestMargin = 0;
  let largestSymbol: string | null = null;

  for (const pos of positions) {
    totalMarginUsed += pos.marginUsed;
    if (pos.marginUsed > largestMargin) {
      largestMargin = pos.marginUsed;
      largestSymbol = pos.symbol;
    }
  }

  const marginUtilizationPercent = Number(((totalMarginUsed / totalEquity) * 100).toFixed(2));
  const largestPositionPercent = Number(((largestMargin / totalEquity) * 100).toFixed(2));

  return {
    totalEquity,
    totalMarginUsed,
    marginUtilizationPercent,
    largestPositionSymbol: largestSymbol,
    largestPositionPercent,
    riskRewardAverage: 2.0 // standard default
  };
}
