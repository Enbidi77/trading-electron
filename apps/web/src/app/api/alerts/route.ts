import { NextResponse } from 'next/server';
import { AlertItemSchema } from '@trd/contracts';
import { AlertEngine } from '@trd/alerts';

const alertEngine = new AlertEngine();

// Seed initial demo alerts
alertEngine.addAlert({
  symbol: 'BTC/USD',
  conditionType: 'PRICE_CROSS_ABOVE',
  thresholdPrice: 95000,
  notes: 'Key resistance breakout alert'
});
alertEngine.addAlert({
  symbol: 'ETH/USD',
  conditionType: 'PRICE_CROSS_BELOW',
  thresholdPrice: 3200,
  notes: 'Support level breakdown alert'
});

export async function GET() {
  try {
    const alerts = alertEngine.getAlerts();
    return NextResponse.json({
      success: true,
      data: alerts,
      timestamp: Date.now()
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch alerts', timestamp: Date.now() },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const alert = alertEngine.addAlert({
      symbol: body.symbol,
      conditionType: body.conditionType || 'PRICE_CROSS_ABOVE',
      thresholdPrice: body.thresholdPrice ? Number(body.thresholdPrice) : undefined,
      percentThreshold: body.percentThreshold ? Number(body.percentThreshold) : undefined,
      notes: body.notes
    });

    return NextResponse.json({
      success: true,
      data: alert,
      message: `Alert created for ${alert.symbol}`,
      timestamp: Date.now()
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create alert', timestamp: Date.now() },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Alert ID is required', timestamp: Date.now() },
        { status: 400 }
      );
    }

    const removed = alertEngine.removeAlert(id);
    if (!removed) {
      return NextResponse.json(
        { success: false, error: 'Alert not found', timestamp: Date.now() },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { id },
      message: 'Alert removed',
      timestamp: Date.now()
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to remove alert', timestamp: Date.now() },
      { status: 500 }
    );
  }
}

