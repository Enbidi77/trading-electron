import { NextResponse } from 'next/server';
import { ensureServerInitialized, serverState } from '@/lib/server-state';
import { screenInstruments } from '@trd/screener';
import type { ScreenerFilter, ScreenerResult } from '@trd/contracts';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const assetClass = searchParams.get('assetClass') as any;
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const minChangePercent = searchParams.get('minChangePercent')
      ? Number(searchParams.get('minChangePercent'))
      : undefined;
    const maxChangePercent = searchParams.get('maxChangePercent')
      ? Number(searchParams.get('maxChangePercent'))
      : undefined;
    const rsiCondition = searchParams.get('rsiCondition') as any;

    await ensureServerInitialized();
    const instruments = await serverState.marketProvider.getInstruments();

    const sampleResults: ScreenerResult[] = instruments.map((inst, index) => {
      const book = serverState.marketProvider.generateOrderBook(inst.symbol);
      const price = book.bids[0]?.price || 100;
      const change24h = Number(((index % 2 === 0 ? 1 : -1) * (price * 0.023)).toFixed(inst.pricePrecision));
      const changePercent24h = Number(((change24h / price) * 100).toFixed(2));
      const rsi = 45 + (index * 7) % 35; // realistic RSI values across symbols

      return {
        symbol: inst.symbol,
        name: inst.name,
        price,
        change24h,
        changePercent24h,
        volume24h: 15000000 + index * 4200000,
        high24h: price * 1.03,
        low24h: price * 0.97,
        rsi,
        sma20: price * 0.99,
        sma50: price * 0.97
      };
    });

    const filter: ScreenerFilter = {
      assetClass: assetClass || undefined,
      minPrice,
      maxPrice,
      minChangePercent,
      maxChangePercent,
      rsiCondition: rsiCondition || undefined
    };

    const filtered = screenInstruments(instruments, sampleResults, filter);

    return NextResponse.json({
      success: true,
      data: filtered,
      count: filtered.length,
      timestamp: Date.now()
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Screener query failed', timestamp: Date.now() },
      { status: 500 }
    );
  }
}

