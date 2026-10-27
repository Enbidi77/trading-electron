import { NextResponse } from 'next/server';
import { ensureServerInitialized, serverState } from '@/lib/server-state';

export async function GET() {
  try {
    await ensureServerInitialized();
    const positions = await serverState.paperBroker.getPositions();
    return NextResponse.json({
      success: true,
      data: positions,
      timestamp: Date.now()
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch positions', timestamp: Date.now() },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { symbol } = body;

    if (!symbol) {
      return NextResponse.json(
        { success: false, error: 'Symbol is required to close position', timestamp: Date.now() },
        { status: 400 }
      );
    }

    await ensureServerInitialized();
    const closed = await serverState.paperBroker.closePosition(symbol);

    if (!closed) {
      return NextResponse.json(
        { success: false, error: `No active position found for ${symbol}`, timestamp: Date.now() },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Position for ${symbol} closed successfully`,
      timestamp: Date.now()
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to close position', timestamp: Date.now() },
      { status: 500 }
    );
  }
}

