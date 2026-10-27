import { NextResponse } from 'next/server';
import { ensureServerInitialized, serverState } from '@/lib/server-state';
import type { Timeframe } from '@trd/contracts';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'BTC/USD';
    const timeframe = (searchParams.get('timeframe') || '15m') as Timeframe;
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10), 10), 1000) : 300;

    await ensureServerInitialized();
    const candles = await serverState.marketProvider.getHistoricalCandles(symbol, timeframe, limit);

    return NextResponse.json({
      success: true,
      data: {
        symbol,
        timeframe,
        count: candles.length,
        candles
      },
      timestamp: Date.now()
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch candle data', timestamp: Date.now() },
      { status: 500 }
    );
  }
}

