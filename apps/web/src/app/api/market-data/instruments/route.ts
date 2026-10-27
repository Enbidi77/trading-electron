import { NextResponse } from 'next/server';
import { ensureServerInitialized, serverState } from '@/lib/server-state';

export async function GET() {
  try {
    await ensureServerInitialized();
    const instruments = await serverState.marketProvider.getInstruments();

    return NextResponse.json({
      success: true,
      data: instruments,
      status: serverState.marketProvider.getStatus(),
      timestamp: Date.now()
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch instruments', timestamp: Date.now() },
      { status: 500 }
    );
  }
}

