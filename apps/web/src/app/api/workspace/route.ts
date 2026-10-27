import { NextResponse } from 'next/server';
import { ensureServerInitialized, serverState } from '@/lib/server-state';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    await ensureServerInitialized();

    if (key === 'settings') {
      const settings = await serverState.workspacePersistence.getSettings();
      return NextResponse.json({ success: true, data: settings, timestamp: Date.now() });
    }

    if (key === 'watchlists') {
      const watchlists = await serverState.workspacePersistence.getWatchlists();
      return NextResponse.json({ success: true, data: watchlists, timestamp: Date.now() });
    }

    if (key?.startsWith('drawings_')) {
      const symbol = key.replace('drawings_', '');
      const drawings = await serverState.workspacePersistence.getDrawings(symbol);
      return NextResponse.json({ success: true, data: drawings, timestamp: Date.now() });
    }

    // Default: full export
    const jsonStr = await serverState.workspacePersistence.exportAll();
    return NextResponse.json({ success: true, data: JSON.parse(jsonStr), timestamp: Date.now() });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to read workspace state', timestamp: Date.now() },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { key, value } = body;

    await ensureServerInitialized();

    if (key === 'settings') {
      await serverState.workspacePersistence.saveSettings(value);
      return NextResponse.json({ success: true, message: 'Settings saved', timestamp: Date.now() });
    }

    if (key === 'watchlists') {
      await serverState.workspacePersistence.saveWatchlists(value);
      return NextResponse.json({ success: true, message: 'Watchlists saved', timestamp: Date.now() });
    }

    if (key?.startsWith('drawings_')) {
      const symbol = key.replace('drawings_', '');
      await serverState.workspacePersistence.saveDrawings(symbol, value);
      return NextResponse.json({ success: true, message: 'Drawings saved', timestamp: Date.now() });
    }

    return NextResponse.json(
      { success: false, error: 'Unknown workspace key', timestamp: Date.now() },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to persist workspace state', timestamp: Date.now() },
      { status: 500 }
    );
  }
}

