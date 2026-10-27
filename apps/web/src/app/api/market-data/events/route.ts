import { ensureServerInitialized, serverState } from '@/lib/server-state';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  await ensureServerInitialized();

  let controllerRef: ReadableStreamDefaultController | null = null;

  const stream = new ReadableStream({
    start(controller) {
      controllerRef = controller;
      serverState.sseClients.add(controller);

      // Send initial connection packet
      const initPayload = {
        type: 'CONNECTED',
        status: serverState.marketProvider.getStatus(),
        serverTime: Date.now()
      };
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode(`event: init\ndata: ${JSON.stringify(initPayload)}\n\n`));
    },
    cancel() {
      if (controllerRef) {
        serverState.sseClients.delete(controllerRef);
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive'
    }
  });
}

