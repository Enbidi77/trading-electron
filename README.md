# TRD Pro — Cross-Platform Liquid Glass Trading Terminal (Desktop & Web)

A production-grade, cross-platform financial trading workstation inspired by TradingView, professional institutional terminals (DXtrade XT / Bloomberg style), and Apple's **Liquid Glass** aesthetic.

TRD Pro delivers a unified trading experience across both an **Electron Desktop Application** (`apps/desktop`) and a **Next.js 15 Web Application** (`apps/web`), sharing core domain models, technical indicators, charting engines, paper-trading simulation, risk mathematics, and UI tokens.

![Trading Terminal Architecture](./docs/architecture/preview.png)

---

## 1. Highlights & Key Features

- **Apple Liquid Glass Aesthetic**: Translucent frosted glass panels (`backdrop-blur-xl`), subtle specular edge highlights, rounded corners, clean tabular typography (`tabular-nums`), and non-fatiguing Emerald Bull (`#10b981`) and Rose Bear (`#f43f5e`) color palettes. Full seamless **Dark & Light theme switching**.
- **Cross-Platform Parity**: Seamless user experience across Electron desktop and modern web browsers with responsive adaptations from 1920x1080 desktop monitors to 1366x768 laptops and tablets.
- **Pro Multichart Workspace**: Layout switcher (`1x1`, `1x2`, `2x1`, `2x2`) with crosshair synchronization and linked symbol inspection.
- **Layered Vector Drawing Engine**: Interactive canvas overlay mapped to logical price & timestamp coordinates (`packages/chart-drawings`). Supports Trendlines, Horizontal Lines, Rays, Fibonacci Retracements, Rectangles, and Risk/Reward planning with selection handles and persistence.
- **Modular Indicator Engine**: Pure mathematical calculations for SMA, EMA, WMA, VWAP, Bollinger Bands, RSI, MACD, Stochastic Oscillator, ATR, Supertrend, and OBV (`packages/indicators`).
- **Level 2 Market Depth (DOM)**: Real-time depth of market ladder with visual volume bars, spread tracker, and instant 1-click Buy (Ask) / Sell (Bid) order routing (`packages/ui`).
- **Real-Time Time & Sales**: Ultra-low-latency trade tape prints with buy/sell size and timestamp streaming.
- **Deterministic Paper Trading Broker**: In-memory simulation broker with margin management, realistic fee accounting (0.05%), position tracking, unrealized & realized P&L updates, and automatic SL/TP bracket execution (`packages/paper-trading`).
- **Risk & Position Sizing Calculator**: Input account equity, risk % budget, entry, and stop loss to automatically compute exact position units, monetary loss risk, and reward-to-risk ratios (`packages/domain`, `packages/risk-engine`).
- **Market Screener & Technical Scans**: Filter instruments by Asset Class (Crypto, Equities, Forex, Indices), Price bounds, 24h % change, Volume, and RSI conditions (`packages/screener`).
- **Strategy Backtester**: Backtest dual moving-average crossovers and indicator triggers over historical bars with an equity curve and trade logs (`packages/backtesting`).
- **Daily Pro Trading Suite**: Economic Calendar with impact badges, Financial News wires with sentiment analysis, Trading Journal with psychology notes, Market Heatmap, and Price Alerts engine.
- **Real-Time Market Feeds**: Server-Sent Events (SSE) streaming live quotes, trade ticks, and order book depths to the web client without Node dependencies.
- **Cloud & Local Persistence**: Transparent workspace synchronization between local browser storage and server endpoints via `HttpPersistenceAdapter` (`packages/persistence`).

---

## 2. Monorepo Package Architecture

The project is structured as a high-cohesion `pnpm` monorepo:

```
apps/
  desktop/                    # Electron main + preload + React 19 renderer
  web/                        # Next.js 15 App Router web application

packages/
  contracts/                  # Zod schemas, DTOs & TypeScript types (Auth, Orders, Workspace)
  domain/                     # Business logic, PnL math, position sizing, margin rules
  shared-utils/               # Formatters, Math, EventEmitter, ID generators
  design-system/              # Liquid Glass tokens, theme colors & CSS variable definitions
  ui/                         # GlassPanel, GlassButton, GlassTabs, PriceTag, DOM Ladder
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
  persistence/                # LocalStorage, HTTP, SQLite, Memory persistence adapters
  configuration/              # App metadata, timeframes, defaults
  logging/                    # Structured logger with levels
```

For detailed architectural flowcharts, runtime boundaries, and sequence diagrams, see [docs/web-architecture.md](docs/web-architecture.md).

---

## 3. Quick Start & Development

### Prerequisites
- Node.js v20+ or v22+
- `pnpm` v10+ (`corepack enable pnpm`)

### Installation
```bash
# Clone the repository and install all monorepo dependencies
pnpm install
```

### Running the Applications

```bash
# Run Next.js web application (http://localhost:3000)
pnpm dev:web

# Run Electron desktop application
pnpm dev:desktop

# Run both desktop and web concurrently
pnpm dev
```

### Running Tests & Quality Verification

```bash
# Run all unit and integration tests (desktop, web & all packages)
pnpm test

# Run end-to-end integration tests
pnpm test:e2e

# Run strict TypeScript typecheck across all 23 monorepo projects
pnpm typecheck

# Run linter across all projects
pnpm lint
```

### Building for Production

```bash
# Build all packages and applications (desktop + web)
pnpm build

# Build only the web application
pnpm build:web

# Build only the desktop application
pnpm build:desktop
```

---

## 4. Web Application Features & Routes

The Next.js web application (`apps/web`) leverages the App Router and React Server Components:

- **Marketing Landing Page** (`/`): Premium product presentation featuring live interactive chart preview, feature highlights, asset coverage, and direct terminal launch.
- **Authentication Pages** (`/login`, `/register`): Secure authentication flow with demo credentials preconfigured (`demo@trdpro.io` / `demo123`), session cookie management, and protected route redirection.
- **Trading Terminal** (`/terminal`): High-density trading workstation with multi-chart layouts (`1x1`, `1x2`, `2x1`, `2x2`), vector drawing tools, technical indicators, Level 2 DOM, Time & Sales tape, and quick order ticket.
- **Watchlists** (`/watchlist`): Multi-list symbol tracking with real-time price updates, search, and sorting.
- **Market Screener** (`/screener`): Multi-asset technical filter by asset class, price range, 24h change, and RSI.
- **Portfolio & Risk** (`/portfolio`, `/risk`): Account equity metrics, positions table, asset allocation, and interactive position sizing calculator.
- **Paper Trading Hub** (`/paper-trading`): Dedicated order management, trade executions log, and portfolio reset tools.
- **Strategy Backtesting** (`/backtesting`): Moving-average crossover and RSI strategy backtester with interactive equity curve and metrics.
- **Trading Tools** (`/alerts`, `/calendar`, `/news`, `/heatmap`): Real-time alert triggers, high-impact economic calendar events, financial news headlines, and sector heatmaps.
- **Settings** (`/settings`): Theme selection (Dark / Light / System), chart preferences, risk budgets, and persistence controls.

---

## 5. Security Architecture

### Electron Desktop
- `contextIsolation: true`
- `nodeIntegration: false`
- `sandbox: true`
- All IPC messages validated at runtime with Zod schemas (`@trd/contracts`)
- Strict Content Security Policy (CSP)
- External hyperlinks opened only through `shell.openExternal`
- Credentials stored via secure OS keychain

### Next.js Web
- **HttpOnly Cookies**: Session tokens stored in secure, `SameSite=Lax` cookies; protected against client-side script access.
- **Strict Boundary Isolation**: No Node.js-only modules or desktop native bindings exposed to browser bundles.
- **Secret Protection**: Server secrets (API keys, auth secrets) strictly isolated on the server tier; zero secrets in client bundles (`NEXT_PUBLIC_`).
- **Input Validation**: All API routes and client forms validated with Zod schemas from `@trd/contracts`.
- **Security Headers**: Standard CSP, anti-clickjacking (`X-Frame-Options: DENY`), and MIME-type sniffing prevention.
