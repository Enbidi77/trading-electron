import { NextResponse } from 'next/server';
import { ensureServerInitialized, serverState } from '@/lib/server-state';
import { validateOrderRequest } from '@trd/trading-engine';

export async function GET() {
  try {
    await ensureServerInitialized();
    const orders = await serverState.paperBroker.getOrders();
    return NextResponse.json({
      success: true,
      data: orders,
      timestamp: Date.now()
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch orders', timestamp: Date.now() },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = validateOrderRequest(body);

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error || 'Invalid order parameters', timestamp: Date.now() },
        { status: 400 }
      );
    }

    await ensureServerInitialized();
    const order = await serverState.paperBroker.placeOrder(body);

    return NextResponse.json({
      success: true,
      data: order,
      message: `${order.side} ${order.quantity} ${order.symbol} (${order.type}) placed successfully`,
      timestamp: Date.now()
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Order execution rejected', timestamp: Date.now() },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required', timestamp: Date.now() },
        { status: 400 }
      );
    }

    await ensureServerInitialized();
    const cancelled = await serverState.paperBroker.cancelOrder(orderId);

    if (!cancelled) {
      return NextResponse.json(
        { success: false, error: 'Could not cancel order (order may already be filled or cancelled)', timestamp: Date.now() },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { orderId, status: 'CANCELLED' },
      timestamp: Date.now()
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to cancel order', timestamp: Date.now() },
      { status: 500 }
    );
  }
}

