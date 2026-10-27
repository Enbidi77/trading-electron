import { describe, it, expect } from 'vitest';
import {
  WorkspacePersistenceService,
  MemoryPersistenceAdapter,
  DEFAULT_USER_SETTINGS
} from '@trd/persistence';

describe('Workspace Persistence & Recovery', () => {
  it('loads default user settings when uninitialized', async () => {
    const memory = new MemoryPersistenceAdapter();
    const service = new WorkspacePersistenceService(memory);

    const settings = await service.getSettings();
    expect(settings.theme).toBe('dark');
    expect(settings.activeSymbol).toBe('BTC/USD');
    expect(settings.chartLayout).toBe('1x1');
  });

  it('updates and persists settings across sessions', async () => {
    const memory = new MemoryPersistenceAdapter();
    const service = new WorkspacePersistenceService(memory);

    const updated = {
      ...DEFAULT_USER_SETTINGS,
      theme: 'light' as const,
      activeSymbol: 'NVDA',
      chartLayout: '2x2' as const
    };
    await service.saveSettings(updated);

    const loaded = await service.getSettings();
    expect(loaded.theme).toBe('light');
    expect(loaded.activeSymbol).toBe('NVDA');
    expect(loaded.chartLayout).toBe('2x2');
  });

  it('exports and imports workspace configuration JSON', async () => {
    const memory = new MemoryPersistenceAdapter();
    const service = new WorkspacePersistenceService(memory);

    const json = await service.exportAll();
    const parsed = JSON.parse(json);
    expect(parsed.settings).toBeDefined();
    expect(parsed.watchlists).toBeDefined();
    expect(parsed.version).toBe(1);

    parsed.settings.activeSymbol = 'SOL/USD';
    const imported = await service.importAll(JSON.stringify(parsed));
    expect(imported).toBe(true);

    const restored = await service.getSettings();
    expect(restored.activeSymbol).toBe('SOL/USD');
  });
});

