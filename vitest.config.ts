import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  resolve: {
    alias: {
      '@trd/contracts': path.resolve(__dirname, 'packages/contracts/src'),
      '@trd/design-system': path.resolve(__dirname, 'packages/design-system/src'),
      '@trd/domain': path.resolve(__dirname, 'packages/domain/src'),
      '@trd/shared-utils': path.resolve(__dirname, 'packages/shared-utils/src'),
      '@trd/ui': path.resolve(__dirname, 'packages/ui/src'),
      '@trd/chart-core': path.resolve(__dirname, 'packages/chart-core/src'),
      '@trd/chart-drawings': path.resolve(__dirname, 'packages/chart-drawings/src'),
      '@trd/indicators': path.resolve(__dirname, 'packages/indicators/src'),
      '@trd/market-data': path.resolve(__dirname, 'packages/market-data/src'),
      '@trd/market-data-providers': path.resolve(__dirname, 'packages/market-data-providers/src'),
      '@trd/trading-engine': path.resolve(__dirname, 'packages/trading-engine/src'),
      '@trd/paper-trading': path.resolve(__dirname, 'packages/paper-trading/src'),
      '@trd/risk-engine': path.resolve(__dirname, 'packages/risk-engine/src'),
      '@trd/portfolio': path.resolve(__dirname, 'packages/portfolio/src'),
      '@trd/screener': path.resolve(__dirname, 'packages/screener/src'),
      '@trd/alerts': path.resolve(__dirname, 'packages/alerts/src'),
      '@trd/backtesting': path.resolve(__dirname, 'packages/backtesting/src'),
      '@trd/persistence': path.resolve(__dirname, 'packages/persistence/src'),
      '@trd/configuration': path.resolve(__dirname, 'packages/configuration/src'),
      '@trd/logging': path.resolve(__dirname, 'packages/logging/src'),
      '@': path.resolve(__dirname, 'apps/web/src')
    }
  },
  test: {
    environment: 'node',
    globals: true
  }
});

