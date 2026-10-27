import { NextResponse } from 'next/server';
import { ensureServerInitialized, serverState } from '@/lib/server-state';

export async function GET() {
  try {
    await ensureServerInitialized();
    const balance = await serverState.paperBroker.getAccountBalance();
    const positions = await serverState.paperBroker.getPositions();
    const orders = await serverState.paperBroker.getOrders();

    return NextResponse.json({
      success: true,
      data: {
        balance,
        positions,
        orders
      },
      timestamp: Date.now()
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch account', timestamp: Date.now() },
      { status: 500 }
    );
  }
}

