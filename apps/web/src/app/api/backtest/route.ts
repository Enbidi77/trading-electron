import { NextResponse } from 'next/server';
import { ensureServerInitialized, serverState } from '@/lib/server-state';
import { runSmaCrossoverBacktest } from '@trd/backtesting';
import type { Timeframe } from '@trd/contracts';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const symbol = body.symbol || 'BTC/USD';
    const timeframe = (body.timeframe || '1h') as Timeframe;
    const fastPeriod = Number(body.fastPeriod || 9);
    const slowPeriod = Number(body.slowPeriod || 21);
    const initialCapital = Number(body.initialCapital || 100000);

    await ensureServerInitialized();
    const candles = await serverState.marketProvider.getHistoricalCandles(symbol, timeframe, 500);

    const backtestResult = runSmaCrossoverBacktest(
      candles,
      fastPeriod,
      slowPeriod,
      initialCapital
    );

    return NextResponse.json({
      success: true,
      data: {
        symbol,
        timeframe,
        fastPeriod,
        slowPeriod,
        totalBars: candles.length,
        ...backtestResult
      },
      timestamp: Date.now()
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Backtest execution failed', timestamp: Date.now() },
      { status: 500 }
    );
  }
}

