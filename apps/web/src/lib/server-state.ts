import { SimulatedMarketDataProvider } from '@trd/market-data-providers';
import { PaperBroker } from '@trd/paper-trading';
import { WorkspacePersistenceService, MemoryPersistenceAdapter } from '@trd/persistence';
import type { Tick, OrderBook, TimeAndSalesTrade } from '@trd/contracts';

// Global singleton registry in server process memory
interface GlobalServerState {
  marketProvider: SimulatedMarketDataProvider;
  paperBroker: PaperBroker;
  workspacePersistence: WorkspacePersistenceService;
  sseClients: Set<ReadableStreamDefaultController>;
  initialized: boolean;
}

const globalForTrd = globalThis as unknown as {
  __TRD_SERVER_STATE__?: GlobalServerState;
};

if (!globalForTrd.__TRD_SERVER_STATE__) {
  const provider = new SimulatedMarketDataProvider();
  const broker = new PaperBroker(100000);
  const persistence = new WorkspacePersistenceService(new MemoryPersistenceAdapter());

  globalForTrd.__TRD_SERVER_STATE__ = {
    marketProvider: provider,
    paperBroker: broker,
    workspacePersistence: persistence,
    sseClients: new Set(),
    initialized: false
  };
}

export const serverState = globalForTrd.__TRD_SERVER_STATE__;

export async function ensureServerInitialized(): Promise<void> {
  if (serverState.initialized) return;

  await serverState.marketProvider.connect();
  const instruments = await serverState.marketProvider.getInstruments();

  // Forward ticks from market provider into broker and broadcast to SSE clients
  for (const inst of instruments) {
    serverState.marketProvider.subscribeTicks(inst.symbol, (tick: Tick) => {
      serverState.paperBroker.onTick(tick);
      broadcastSSE('tick', tick);
    });

    serverState.marketProvider.subscribeTrades(inst.symbol, (trade: TimeAndSalesTrade) => {
      broadcastSSE('trade', trade);
    });
  }

  serverState.initialized = true;
}

export function broadcastSSE(event: string, data: any): void {
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  const encoder = new TextEncoder();
  const bytes = encoder.encode(message);

  for (const controller of serverState.sseClients) {
    try {
      controller.enqueue(bytes);
    } catch {
      serverState.sseClients.delete(controller);
    }
  }
}

