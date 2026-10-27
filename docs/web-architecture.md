# TRD Pro — Web Application Architecture & Cross-Platform Specification

This document provides a comprehensive architectural specification of the **TRD Pro Next.js Web Application** (`apps/web`) and its integration within the cross-platform monorepo alongside the Electron desktop application (`apps/desktop`).

---

## 1. Monorepo Architecture Overview

The TRD Pro platform is structured as a high-cohesion `pnpm` monorepo dividing platform-specific application shells from reusable domain, UI, and market-data packages.

```mermaid
flowchart TD
    subgraph Applications["Applications (apps/)"]
        Desktop["apps/desktop\n(Electron Desktop Shell)"]
        Web["apps/web\n(Next.js 15 App Router)"]
    end

    subgraph SharedPackages["Shared Packages (packages/)"]
        subgraph ContractsConfig["Contracts & Configuration"]
            Contracts["@trd/contracts\n(Zod Schemas, DTOs, TypeScript Types)"]
            Config["@trd/configuration\n(Symbols, Timeframes, Constants)"]
            Logging["@trd/logging\n(Structured Logger)"]
        end

        subgraph CoreMath["Core Domain & Calculations"]
            Domain["@trd/domain\n(PnL, Position Sizing, Margins)"]
            SharedUtils["@trd/shared-utils\n(Formatters, Math, EventEmitter, IDs)"]
            Indicators["@trd/indicators\n(SMA, EMA, RSI, MACD, BB, Supertrend)"]
        end

        subgraph UIDesign["UI & Design System"]
            DesignSystem["@trd/design-system\n(Liquid Glass Tokens, Themes, Colors)"]
            UI["@trd/ui\n(GlassPanel, GlassButton, Tabs, Badges)"]
        end

        subgraph Charting["Charting Engine"]
            ChartCore["@trd/chart-core\n(Lightweight Charts Adapter, Series)"]
            ChartDrawings["@trd/chart-drawings\n(Vector Drawing Overlay, Trendlines, Fib)"]
        end

        subgraph MarketData["Market Data Pipeline"]
            MarketDataPkg["@trd/market-data\n(Provider Interfaces, Candle Aggregation)"]
            MarketDataProviders["@trd/market-data-providers\n(Multi-Asset Simulation Engine)"]
        end

        subgraph TradingAnalytics["Trading Engines & Analytics"]
            TradingEngine["@trd/trading-engine\n(Order State Machine, Interfaces)"]
            PaperTrading["@trd/paper-trading\n(Paper Broker, Position Tracker)"]
            RiskEngine["@trd/risk-engine\n(Portfolio Risk, Exposure Evaluator)"]
            Portfolio["@trd/portfolio\n(Equity Curves, Win Rate, Allocation)"]
            Screener["@trd/screener\n(Multi-Condition Filtering Engine)"]
            Alerts["@trd/alerts\n(Price Threshold & Trigger Evaluator)"]
            Backtesting["@trd/backtesting\n(Historical Strategy Simulator)"]
        end

        subgraph Storage["Persistence"]
            Persistence["@trd/persistence\n(LocalStorage, HTTP, Memory Adapters)"]
        end
    end

    Desktop --> UI
    Desktop --> DesignSystem
    Desktop --> ChartCore
    Desktop --> ChartDrawings
    Desktop --> Indicators
    Desktop --> MarketDataProviders
    Desktop --> PaperTrading
    Desktop --> Persistence

    Web --> UI
    Web --> DesignSystem
    Web --> ChartCore
    Web --> ChartDrawings
    Web --> Indicators
    Web --> MarketDataProviders
    Web --> PaperTrading
    Web --> RiskEngine
    Web --> Portfolio
    Web --> Screener
    Web --> Alerts
    Web --> Backtesting
    Web --> Persistence
    Web --> Contracts
    Web --> Config
```

---

## 2. Shared Packages & Dependency Graph

All shared packages are pure isomorphic TypeScript packages with standard ESM exports, allowing direct compilation by both Vite (in Electron) and Next.js / Webpack / Turbopack (in Web).

```mermaid
flowchart TD
    Contracts["@trd/contracts"]
    Config["@trd/configuration"]
    SharedUtils["@trd/shared-utils"]
    Logging["@trd/logging"]

    Domain["@trd/domain"] --> Contracts
    Domain --> SharedUtils

    DesignSystem["@trd/design-system"]
    UI["@trd/ui"] --> DesignSystem

    Indicators["@trd/indicators"] --> Contracts
    Indicators --> SharedUtils

    ChartDrawings["@trd/chart-drawings"] --> Contracts
    ChartCore["@trd/chart-core"] --> Contracts
    ChartCore --> Indicators

    MarketData["@trd/market-data"] --> Contracts
    MarketDataProviders["@trd/market-data-providers"] --> MarketData
    MarketDataProviders --> SharedUtils

    TradingEngine["@trd/trading-engine"] --> Contracts
    PaperTrading["@trd/paper-trading"] --> TradingEngine
    PaperTrading --> Domain

    RiskEngine["@trd/risk-engine"] --> Domain
    Portfolio["@trd/portfolio"] --> Domain
    Screener["@trd/screener"] --> Contracts
    Alerts["@trd/alerts"] --> Contracts
    Backtesting["@trd/backtesting"] --> Contracts
    Backtesting --> Indicators

    Persistence["@trd/persistence"] --> Contracts
```

---

## 3. Electron vs. Next.js Runtime Boundaries

The application cleanly separates desktop-native system capabilities from web and browser runtimes. No Electron main-process or Node-only OS bindings are bundled into the web client.

```mermaid
flowchart LR
    subgraph ElectronDesktop["Desktop Target (Electron)"]
        MainProcess["Main Process (Node.js)\n- Window Management\n- SQLite Local Database\n- OS Keychain / Credentials\n- Tray & Native Menus"]
        IPCBridge["Preload ContextBridge (IPC)\n- Secure channel validation\n- Zod IPC message filtering"]
        DesktopRenderer["Renderer Process (Chromium)\n- React 19 + Vite\n- Desktop UI Views\n- Direct IPC Invocation"]
        MainProcess <--> IPCBridge <--> DesktopRenderer
    end

    subgraph SharedCore["Isomorphic Shared Layer"]
        SharedLogic["- Design System & Liquid Glass Tokens\n- Pure Mathematical Indicators\n- Vector Drawing Geometry\n- Contracts & Validation Schemas\n- Domain Calculations (PnL, Risk)"]
    end

    subgraph NextWeb["Web Target (Next.js 15)"]
        WebClient["Client Browser (React 19)\n- Server & Client Components\n- Zustand Workspace Store\n- TanStack Query\n- HTML5 Canvas & Charts\n- LocalStorage / Session Cache"]
        HTTP_SSE["Network Boundary (HTTP / HTTPS / SSE)\n- Strict CSP & Security Headers\n- HttpOnly Session Cookies"]
        WebServer["Next.js Server Runtime (Node.js)\n- App Router Route Handlers\n- Server-Sent Events Broadcaster\n- In-Memory / DB Session Store\n- Headless Market Simulation Singleton"]
        WebClient <--> HTTP_SSE <--> WebServer
    end

    DesktopRenderer -.-> SharedLogic
    WebClient -.-> SharedLogic
    WebServer -.-> SharedLogic
```

---

## 4. Browser Authentication & Session Flow

Authentication on the web application follows a secure cookie-based session pattern using HTTP-only cookies and Next.js middleware protection.

```mermaid
sequenceDiagram
    autonumber
    actor User as Trader (Browser)
    participant Client as Next.js Client (`/login`)
    participant Middleware as Next.js Middleware (`middleware.ts`)
    participant AuthAPI as Route Handler (`/api/auth/login`)
    participant SessionStore as Auth Service (`lib/auth.ts`)
    participant Dashboard as Protected Route (`/terminal`)

    User->>Client: Enters credentials (email/password)
    Client->>Client: Validate with LoginRequestSchema (Zod)
    Client->>AuthAPI: POST /api/auth/login
    AuthAPI->>SessionStore: validateCredentials(email, password)
    SessionStore->>SessionStore: Verify hash & issue session token
    SessionStore-->>AuthAPI: UserSession & Token
    AuthAPI-->>Client: 200 OK + Set-Cookie: trd_session_token (HttpOnly, SameSite=Lax)
    Client->>Client: Store user profile in Zustand auth state
    Client->>Dashboard: Navigate to /terminal
    Dashboard->>Middleware: Intercept route request
    Middleware->>Middleware: Verify presence of trd_session_token cookie
    alt Valid Session
        Middleware-->>Dashboard: Allow access & pass request
        Dashboard-->>User: Render Trading Terminal Workspace
    else Invalid / Missing Session
        Middleware-->>User: Redirect to /login?from=/terminal
    end
```

---

## 5. Market-Data Streaming Pipeline (SSE)

Market data feeds into the web application via Server-Sent Events (SSE), providing real-time quote updates, candle bars, and order book depth without client-side Node dependencies.

```mermaid
sequenceDiagram
    autonumber
    participant SimProvider as MultiAssetSimulationProvider
    participant Broadcaster as SSE Broadcaster (`server-state.ts`)
    participant SSERoute as Next.js SSE Route (`/api/market-data/events`)
    participant WebStore as Zustand Store (`useWebTerminalStore`)
    participant ChartView as Chart Workspace (`WebChartWorkspace`)
    participant DOMView as Level 2 DOM (`WebOrderBookDOM`)

    SimProvider->>Broadcaster: onQuote(symbol, quote)
    Broadcaster->>SSERoute: Push payload to active client streams
    SSERoute-->>WebStore: EventSource message (quote / candle update)
    WebStore->>WebStore: updateQuote(symbol, quote) & appendTick(symbol, tick)
    par Real-time Chart Update
        WebStore->>ChartView: Trigger tick update on active series
        ChartView->>ChartView: Render latest candle / live crosshair
    and Real-time Depth Update
        WebStore->>DOMView: Trigger L2 ladder depth re-render
        DOMView->>DOMView: Update bid/ask volume bars & spread
    end
```

---

## 6. Client, Next.js Server & Backend API Interactions

The application leverages Next.js Route Handlers to isolate business engines, market simulation state, and data management on the server tier.

```mermaid
flowchart TD
    subgraph BrowserClient["Browser Client Tier"]
        UIViews["Views: Terminal, Watchlist, Screener, Portfolio, Paper Trading, Alerts, Backtest"]
        ZustandStore["Zustand Client Store\n(useWebTerminalStore)"]
        QueryClient["TanStack Query Client"]
        ApiClient["Typed API Client\n(@trd/contracts validated)"]
        
        UIViews <--> ZustandStore
        UIViews <--> QueryClient
        QueryClient --> ApiClient
    end

    subgraph NextServer["Next.js 15 Server Tier (Route Handlers)"]
        AuthRoute["/api/auth/*\n(Login, Register, Session, Logout)"]
        MarketRoute["/api/market-data/*\n(Instruments, Candles, Quotes, Events SSE)"]
        TradingRoute["/api/trading/*\n(Account, Orders, Positions)"]
        ScreenerRoute["/api/screener\n(Multi-asset technical filter)"]
        AlertsRoute["/api/alerts\n(Rule evaluation & notification)"]
        BacktestRoute["/api/backtest\n(Historical strategy runner)"]
        WorkspaceRoute["/api/workspace\n(Layout & tool preferences)"]
    end

    subgraph ServerEngines["Server Domain State (Singletons)"]
        PaperBrokerEngine["Paper Broker Engine\n(@trd/paper-trading)"]
        SimMarketEngine["Simulation Provider\n(@trd/market-data-providers)"]
        ScreenerService["Screener Engine\n(@trd/screener)"]
        AlertService["Alerts Engine\n(@trd/alerts)"]
        BacktesterService["Backtester Engine\n(@trd/backtesting)"]
        UserSessionStore["Auth & Session Store\n(lib/auth.ts)"]
        WorkspaceStore["Workspace Storage\n(lib/server-state.ts)"]
    end

    ApiClient --> AuthRoute
    ApiClient --> MarketRoute
    ApiClient --> TradingRoute
    ApiClient --> ScreenerRoute
    ApiClient --> AlertsRoute
    ApiClient --> BacktestRoute
    ApiClient --> WorkspaceRoute

    AuthRoute --> UserSessionStore
    MarketRoute --> SimMarketEngine
    TradingRoute --> PaperBrokerEngine
    ScreenerRoute --> ScreenerService
    AlertsRoute --> AlertService
    BacktestRoute --> BacktesterService
    WorkspaceRoute --> WorkspaceStore
```

---

## 7. Workspace Persistence & Synchronization

Workspaces are preserved across browser refreshes and sync transparently between client storage and the server persistence store.

```mermaid
sequenceDiagram
    autonumber
    actor Trader as Trader
    participant UI as Web Terminal UI
    participant Store as Zustand Workspace Store
    participant Adapter as HttpPersistenceAdapter
    participant Server as /api/workspace Route

    Trader->>UI: Customizes chart layout (adds RSI, draws Trendline, changes to 2x2)
    UI->>Store: updateLayout() / addIndicator() / addDrawing()
    Store->>Store: Mutate active workspace state
    Note over Store,Adapter: Debounced auto-save (e.g. 500ms after edits)
    Store->>Adapter: saveWorkspace(workspaceState)
    Adapter->>Server: POST /api/workspace (JSON payload)
    Server->>Server: Validate WorkspaceStateSchema
    Server->>Server: Persist in memory / user profile database
    Server-->>Adapter: 200 OK ({ success: true, savedAt })
    Adapter-->>Store: Confirm sync status

    opt Page Reload / New Device
        Trader->>UI: Refreshes page / Signs in on new browser
        UI->>Adapter: loadWorkspace()
        Adapter->>Server: GET /api/workspace
        Server-->>Adapter: 200 OK (WorkspaceState JSON)
        Adapter-->>Store: restoreWorkspace(state)
        Store-->>UI: Instantly restore chart layouts, drawings, indicators & watchlist
    end
```

---

## 8. Paper-Trading Order Lifecycle

The paper trading execution engine handles market, limit, stop, and bracket (SL/TP) orders with realistic balance and margin accounting.

```mermaid
stateDiagram-v2
    [*] --> New: Order Ticket Submission
    New --> Rejected: Insufficient Margin / Invalid Price
    New --> Working: Validated & Accepted by Broker

    state Working {
        [*] --> InBook: Placed in Order Book
        InBook --> PriceMatched: Market Price Touches Limit / Stop
        InBook --> CancelledByUser: Cancel Request Received
    }

    PriceMatched --> Filled: Executed at Fill Price
    CancelledByUser --> Cancelled: Order Removed

    state PositionLifecycle {
        [*] --> OpenPosition: Position Created / Average Entry Updated
        OpenPosition --> SL_TP_Monitored: Bracket Orders Active
        SL_TP_Monitored --> ExitTriggered: Stop-Loss or Take-Profit Hit
        ExitTriggered --> ClosedPosition: Realized PnL Calculated & Cash Returned
    }

    Filled --> PositionLifecycle
    ClosedPosition --> [*]
    Cancelled --> [*]
    Rejected --> [*]
```

---

## 9. Developer Setup & Operations

### Prerequisites
- **Node.js**: v20.x or v22.x+
- **pnpm**: v10.x+ (`corepack enable pnpm`)
- Modern web browser (Chrome, Safari, Firefox, Edge)

### Installation
```bash
# Clone the repository and install all workspace dependencies
git clone <repo-url>
cd trd-ele
pnpm install
```

### Running Locally
```bash
# Start Next.js web application (http://localhost:3000)
pnpm dev:web

# Start Electron desktop application
pnpm dev:desktop

# Run both desktop and web concurrently
pnpm dev
```

### Verification & Testing
```bash
# Run all unit and integration tests across all 20 packages and apps/web
pnpm test

# Run end-to-end integration tests
pnpm test:e2e

# Run strict TypeScript typecheck across all monorepo workspaces
pnpm typecheck

# Run linter
pnpm lint

# Build all packages and applications for production
pnpm build
```

---

## 10. Data Provider Configuration

The web application ships with a deterministic, multi-asset market simulation provider (`MultiAssetSimulationProvider`) that models realistic market micro-structure (spreads, ticks, order books, volatility).

To switch to a live market data provider (e.g. Binance, Coinbase, Polygon, Interactive Brokers):
1. Implement the `MarketDataProvider` interface defined in `@trd/market-data`.
2. Configure provider API credentials in `.env.local`:
   ```bash
   MARKET_DATA_PROVIDER=live
   MARKET_DATA_API_KEY=your_secure_server_key
   MARKET_DATA_WS_URL=wss://feed.yourprovider.com/stream
   ```
3. Initialize the provider in `apps/web/src/lib/server-state.ts`.
4. *Important Security Rule*: Never prefix backend market provider API keys or secrets with `NEXT_PUBLIC_`.

---

## 11. Authentication Configuration

The web application includes an authentication system with a preconfigured demo account:
- **Email**: `demo@trdpro.io`
- **Password**: `demo123`

### Production Auth Setup
To integrate with an identity provider (Auth0, Supabase, Clerk, AWS Cognito, NextAuth):
1. In `apps/web/src/lib/auth.ts`, replace the in-memory user registry with your database or auth provider client.
2. Maintain the contract interface (`validateCredentials`, `createSession`, `getSessionUser`) defined in `@trd/contracts`.
3. Set the cookie encryption secret in `.env.production`:
   ```bash
   AUTH_SECRET=super_secret_64_char_key
   COOKIE_DOMAIN=.yourdomain.com
   ```

---

## 12. Production Deployment Guidelines

### Standalone Docker Deployment
`apps/web` can be deployed as a containerized standalone Next.js server:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable pnpm
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm build:web

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
```

### Vercel / Cloudflare Deployment
Configure build settings in the deployment dashboard:
- **Root Directory**: `apps/web` (or root with `--filter @trd/web`)
- **Build Command**: `pnpm build:web`
- **Output Directory**: `.next`

---

## 13. Connection Troubleshooting

| Symptom | Probable Cause | Resolution |
| :--- | :--- | :--- |
| **SSE Market Feed Disconnected** | Browser firewall or reverse proxy buffering SSE chunks | Ensure Nginx / Cloudflare has buffering disabled: `proxy_buffering off;` and `X-Accel-Buffering: no`. |
| **Auth Session Lost on Refresh** | Cookie rejected due to `Secure` flag on HTTP localhost | In development, cookies set `secure: process.env.NODE_ENV === 'production'`. Ensure testing over HTTPS if configured for production. |
| **Hydration Mismatch on Chart** | DOM-dependent Canvas code executing during SSR | Charts are wrapped inside Client Components with `useEffect` and container ref checks to guarantee browser-only execution. |
| **Drawings Displaced on Resize** | Canvas pixel buffer not synced with CSS dimensions | Canvas resizing is handled via `ResizeObserver` updating width/height properties and re-rendering paths against logical prices. |

