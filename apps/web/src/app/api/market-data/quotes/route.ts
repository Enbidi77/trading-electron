import { NextResponse } from 'next/server';
import { ensureServerInitialized, serverState } from '@/lib/server-state';

export async function GET() {
  try {
    await ensureServerInitialized();
    const instruments = await serverState.marketProvider.getInstruments();

    const quotes = instruments.map((inst) => {
      const book = serverState.marketProvider.generateOrderBook(inst.symbol);
      const topBid = book.bids[0]?.price || 100;
      const topAsk = book.asks[0]?.price || 100;
      const mid = (topBid + topAsk) / 2;
      const spread = topAsk - topBid;

      return {
        symbol: inst.symbol,
        name: inst.name,
        assetClass: inst.assetClass,
        price: mid,
        bid: topBid,
        ask: topAsk,
        spread,
        high24h: mid * 1.035,
        low24h: mid * 0.965,
        change24h: mid * 0.015,
        changePercent24h: 1.5,
        volume24h: 125000000,
        exchange: inst.exchange,
        timestamp: Date.now()
      };
    });

    return NextResponse.json({
      success: true,
      data: quotes,
      timestamp: Date.now()
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch quotes', timestamp: Date.now() },
      { status: 500 }
    );
  }
}

