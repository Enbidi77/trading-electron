# TRD Pro — Professional Liquid Glass Desktop Trading Terminal

A production-quality desktop trading terminal application inspired by TradingView, professional financial workstations (DXtrade XT / Bloomberg style), and Apple's **Liquid Glass** aesthetic.

![Trading Terminal Architecture](./docs/architecture/preview.png)

## 1. Highlights & Key Features

- **Apple Liquid Glass Aesthetic**: Translucent frosted panels (`backdrop-blur-xl`), subtle specular edge highlights, rounded corners, clean tabular typography (`tabular-nums`), and non-fatiguing Emerald Bull (`#10b981`) and Rose Bear (`#f43f5e`) color palettes. Full seamless **Dark & Light theme switching**.
- **Pro Multichart Workspace**: Layout switcher (`1x1`, `1x2`, `2x1`, `2x2`) with crosshair synchronization and linked symbol inspection.
- **Layered Vector Drawing Engine**: Interactive canvas overlay mapped to logical price & timestamp coordinates (`packages/chart-drawings`). Supports Trendlines, Horizontal Lines, Rays, Fibonacci Retracements, Rectangles, and Risk/Reward planning with selection handles and persistence.
- **Modular Indicator Engine**: Pure mathematical calculations for SMA, EMA, WMA, VWAP, Bollinger Bands, RSI, MACD, Stochastic Oscillator, ATR, Supertrend, and OBV (`packages/indicators`).
- **Level 2 Market Depth (DOM)**: Real-time depth of market ladder with visual volume bars, spread tracker, and instant 1-click Buy (Ask) / Sell (Bid) order routing (`packages/ui`).
- **Real-Time Time & Sales**: Ultra-low-latency trade tape prints with buy/sell size and timestamp streaming.
- **Deterministic Paper Trading Broker**: In-memory simulation broker with margin management, realistic fee accounting (0.05%), position tracking, unrealized & realized P&L updates, and automatic SL/TP bracket execution.
- **Risk & Position Sizing Calculator**: Input account equity, risk % budget, entry, and stop loss to automatically compute exact position units, monetary loss risk, and reward-to-risk ratios.
- **Market Screener & Technical Scans**: Filter instruments by Asset Class (Crypto, Equities, Forex, Indices), Price bounds, 24h % change, Volume, and RSI conditions.
- **Strategy Backtester**: Backtest dual moving-average crossovers and indicator triggers over historical bars with an equity curve and trade logs.
- **Daily Pro Trading Suite**: Economic Calendar with impact badges, Financial News wires with sentiment analysis, Trading Journal with psychology notes, and Price Alerts engine.

---

## 2. Monorepo Package Architecture

The project is structured as a modular `pnpm` monorepo:

```
apps/
  desktop/                    # Electron main + preload + React 19 renderer

packages/
  contracts/                  # Zod schemas, DTOs & TypeScript types
  domain/                     # Business logic, PnL math, position sizing
  shared-utils/               # Formatters, Math, EventEmitter, ID generators
  design-system/              # Liquid Glass tokens, theme colors & styles
  ui/                         # GlassPanel, GlassButton, GlassTabs, PriceTag
  chart-core/                 # Lightweight Charts adapter, series controllers
  chart-drawings/             # Vector drawing layer (Trendlines, Fib, Rectangles)
  indicators/                 # Pure calculation algorithms (SMA, RSI, MACD, etc.)
  market-data/                # Provider interfaces, candle aggregation pipelines
  market-data-providers/      # High-fidelity multi-asset simulation engine
  trading-engine/             # Order state machine & broker adapter interfaces
  paper-trading/              # Paper execution broker & position tracker
  risk-engine/                # Risk metrics & portfolio exposure evaluator
  portfolio/                  # Equity curve, win rate & asset allocation calculations
  screener/                   # Multi-condition screening filter engine
  alerts/                     # Price threshold & indicator trigger evaluation
  backtesting/                # Historical strategy simulator & trade tracker
  persistence/                # LocalStorage / SQLite workspace persistence
  configuration/              # App metadata, timeframes, defaults
  logging/                    # Structured logger with levels
```

---

## 3. Quick Start & Development

### Prerequisites
- Node.js v20+ or v24+
- `pnpm` v10+

### Installation
```bash
# Clone the repository and install all monorepo dependencies
pnpm install
```

### Running the Application

```bash
# Start Vite development server for the renderer
pnpm --filter @trd/desktop dev

# Start Electron desktop application
pnpm --filter @trd/desktop dev:electron
```

### Running Tests
All packages include unit and integration tests using Vitest:

```bash
# Run all package test suites
pnpm test
```

### Building for Production
```bash
# Build all packages and the desktop application
pnpm build
```

---

## 4. Electron Security Best Practices

- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: true`
- All IPC messages validated at runtime with Zod schemas
- Strict Content Security Policy (CSP)
- External hyperlinks opened only through `shell.openExternal`
- Credentials stored via secure OS keychain
