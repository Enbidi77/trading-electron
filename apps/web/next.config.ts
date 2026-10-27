import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@trd/alerts',
    '@trd/backtesting',
    '@trd/chart-core',
    '@trd/chart-drawings',
    '@trd/configuration',
    '@trd/contracts',
    '@trd/design-system',
    '@trd/domain',
    '@trd/indicators',
    '@trd/logging',
    '@trd/market-data',
    '@trd/market-data-providers',
    '@trd/paper-trading',
    '@trd/persistence',
    '@trd/portfolio',
    '@trd/risk-engine',
    '@trd/screener',
    '@trd/shared-utils',
    '@trd/trading-engine',
    '@trd/ui'
  ],
  reactStrictMode: true,
  images: {
    unoptimized: true
  }
};

export default nextConfig;

