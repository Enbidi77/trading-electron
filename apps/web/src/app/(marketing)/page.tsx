import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Cpu,
  Layers,
  LineChart,
  Lock,
  PieChart,
  Shield,
  Sparkles,
  Terminal,
  TrendingUp,
  Zap
} from 'lucide-react';
import { InteractiveChartPreview } from '@/components/InteractiveChartPreview';

export default function MarketingPage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full max-w-7xl mx-auto pt-20 pb-16 px-6 flex flex-col items-center text-center overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-sky-500/15 via-indigo-500/10 to-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-sky-400 mb-6 backdrop-blur-md shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>Next.js App Router Web Application for TRD Pro Monorepo</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.15]">
          Institutional-Grade Trading{' '}
          <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
            Liquid Glass Terminal
          </span>{' '}
          in Your Browser.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          Access high-performance financial charting, synchronized multi-chart workspaces, vector drawings,
          real-time Depth of Market (DOM), risk calculations, and deterministic paper trading anywhere without installing software.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/terminal"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 via-sky-400 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-xl shadow-sky-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <Terminal className="w-4 h-4" />
            Launch Web Terminal
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#0d131f]/80 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm backdrop-blur-xl transition-all hover:border-white/20"
          >
            Sign In with Demo Account
          </Link>
        </div>

        {/* Live Interactive Chart Component */}
        <div className="mt-14 w-full max-w-5xl">
          <InteractiveChartPreview />
        </div>
      </section>

      {/* Supported Asset Classes */}
      <section id="markets" className="w-full py-16 border-y border-white/10 bg-[#060910]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-xs uppercase tracking-widest text-sky-400 font-semibold mb-2">Multi-Asset Execution</h2>
            <p className="text-2xl font-bold text-white">One Unified Platform for Global Markets</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Cryptocurrency', count: 'BTC, ETH, SOL, L1/L2s', icon: '₿', change: '+3.4%' },
              { label: 'US Equities', count: 'AAPL, NVDA, TSLA, Tech', icon: '📈', change: '+1.8%' },
              { label: 'Foreign Exchange', count: 'EUR/USD, GBP, Majors', icon: '💱', change: '+0.4%' },
              { label: 'Commodities', count: 'Gold, Crude Oil, Silver', icon: '🛢️', change: '-0.2%' },
              { label: 'Global Indices', count: 'SPY, QQQ, Dow Jones', icon: '🏛️', change: '+1.1%' }
            ].map((market) => (
              <div
                key={market.label}
                className="p-5 rounded-2xl bg-[#090d16]/70 border border-white/10 backdrop-blur-xl flex flex-col justify-between hover:border-sky-500/30 transition-all hover:-translate-y-1"
              >
                <div>
                  <div className="text-2xl mb-2">{market.icon}</div>
                  <div className="font-semibold text-sm text-white">{market.label}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{market.count}</div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">24h Volatility</span>
                  <span className="font-mono text-emerald-400 font-medium">{market.change}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="w-full py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs uppercase tracking-widest text-sky-400 font-semibold mb-2">Core Capabilities</h2>
          <p className="text-3xl font-extrabold text-white">Engineered for Technical Traders</p>
          <p className="mt-3 text-sm text-slate-400">
            Powered by shared mathematical algorithms and rendering architectures identical to the desktop application.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: BarChart3,
              title: 'Lightweight Charts v5 & Vector Drawings',
              desc: 'High-framerate candlestick, line, and area charts with Trendlines, Rays, Fibonacci retracements, and Rectangles mapped directly to price coordinates.'
            },
            {
              icon: Zap,
              title: 'Level 2 Depth of Market (DOM)',
              desc: 'Real-time order book visualization with depth bars, cumulative bid/ask totals, spread tracking, and instant one-click order placement.'
            },
            {
              icon: Cpu,
              title: 'Pure Mathematical Indicators',
              desc: '11 built-in technical indicators calculated on pure CPU threads: SMA, EMA, WMA, VWAP, Bollinger Bands, RSI, MACD, Stochastic, ATR, Supertrend, and OBV.'
            },
            {
              icon: Shield,
              title: 'Deterministic Paper Trading Broker',
              desc: 'Realistic trade simulation with 0.05% taker fees, margin calculation, unrealized and realized P&L tracking, and automatic stop-loss and take-profit executions.'
            },
            {
              icon: PieChart,
              title: 'Risk & Position Sizing Engine',
              desc: 'Calculate precise lot sizing based on account equity, maximum percentage risk budget, entry price, and stop loss to enforce disciplined capital preservation.'
            },
            {
              icon: Layers,
              title: 'Apple Liquid Glass Aesthetic',
              desc: 'Layered frosted surfaces, specular edge highlights, high-density data tables, and seamless switching between Dark and Light themes without flicker.'
            }
          ].map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="p-6 rounded-2xl bg-[#090d16]/80 border border-white/10 backdrop-blur-xl flex flex-col gap-3 hover:border-white/20 transition-all hover:bg-[#0d131f]/90"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-white">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Security & Reliability */}
      <section id="security" className="w-full py-16 bg-[#060910] border-y border-white/10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium mb-4">
              <Lock className="w-3.5 h-3.5" />
              Institutional Security Standards
            </div>
            <h2 className="text-3xl font-extrabold text-white">Designed for Privacy and Zero Credential Exposure</h2>
            <p className="mt-4 text-xs sm:text-sm text-slate-400 leading-relaxed">
              Private API keys and brokerage credentials never enter client JavaScript bundles. Next.js server-side
              Route Handlers provide an isolated security boundary with HTTP-only cookie sessions, CSRF protection, and
              strict Content Security Policies.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero Secrets in Browser Bundles</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Encrypted HTTP-Only Sessions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Server-Side Order Validation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Strict CSP & Permissions Policy</span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-96 p-6 rounded-2xl bg-[#090d16]/90 border border-white/10 backdrop-blur-2xl shadow-xl flex flex-col gap-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 text-slate-400">
              <span>SECURITY CHECK</span>
              <span className="text-emerald-400">PASSED</span>
            </div>
            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Session Guard:</span>
                <span className="text-slate-200">HTTP-Only / Lax</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Market Feed:</span>
                <span className="text-slate-200">Simulated / SSE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Memory Protection:</span>
                <span className="text-emerald-400">Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Desktop / Web Parity:</span>
                <span className="text-sky-400">Synchronized</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Plan Placeholders */}
      <section id="pricing" className="w-full py-20 px-6 max-w-7xl mx-auto text-center">
        <h2 className="text-xs uppercase tracking-widest text-sky-400 font-semibold mb-2">Platform Access</h2>
        <p className="text-3xl font-extrabold text-white">Transparent Plans for Every Stage</p>
        <p className="mt-3 text-sm text-slate-400 max-w-xl mx-auto">
          Experience full functionality with our open community edition or scale to high-frequency execution.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left">
          {[
            {
              name: 'Community',
              price: '$0',
              period: '/ forever',
              desc: 'Ideal for individual retail traders exploring markets with simulated execution.',
              features: ['Full Web Terminal access', '1x1 & 1x2 Chart Layouts', '11 Technical Indicators', '$100k Paper Balance', 'Community Watchlists'],
              button: 'Start Free',
              highlight: false
            },
            {
              name: 'Professional Pro',
              price: '$49',
              period: '/ month',
              desc: 'For active traders demanding multichart layouts, vector drawing sync, and advanced screener.',
              features: ['Multi-chart 2x2 Layouts', 'Unlimited Vector Drawings', 'Server Workspace Sync', 'Real-Time Level 2 DOM', 'Strategy Backtesting Suite', 'Instant Price Alerts'],
              button: 'Launch Pro Trial',
              highlight: true
            },
            {
              name: 'Desk & Institutional',
              price: '$199',
              period: '/ month',
              desc: 'Prop desks, fund managers, and teams requiring dedicated feeds and custom adapters.',
              features: ['Everything in Pro', 'Custom Data Providers', 'Direct Broker API Access', 'Shared Team Workspaces', 'Priority Engine Allocation'],
              button: 'Contact Desk',
              highlight: false
            }
          ].map((plan) => (
            <div
              key={plan.name}
              className={`p-7 rounded-2xl flex flex-col justify-between transition-all ${
                plan.highlight
                  ? 'bg-[#0f172a]/90 border-2 border-sky-500/50 shadow-2xl shadow-sky-500/10 -translate-y-2'
                  : 'bg-[#090d16]/70 border border-white/10'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-white">{plan.name}</h3>
                  {plan.highlight && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-2 min-h-[36px]">{plan.desc}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-xs text-slate-400">{plan.period}</span>
                </div>

                <div className="mt-6 space-y-2.5 pt-6 border-t border-white/10 text-xs text-slate-300">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/terminal"
                  className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    plan.highlight
                      ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-lg shadow-sky-500/20'
                      : 'bg-white/10 hover:bg-white/15 text-white'
                  }`}
                >
                  {plan.button}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

