import Link from 'next/link';
import { Activity, ArrowRight, ShieldCheck, Sparkles, Terminal } from 'lucide-react';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#070a11] text-slate-100 selection:bg-sky-500/30 selection:text-sky-200">
      {/* Liquid Glass Navigation Bar */}
      <header className="sticky top-0 z-50 h-16 w-full px-6 flex items-center justify-between bg-[#070a11]/80 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 via-indigo-500 to-emerald-400 p-[1px] shadow-lg shadow-sky-500/20">
              <div className="w-full h-full bg-[#070a11] rounded-[7px] flex items-center justify-center">
                <Activity className="w-4 h-4 text-sky-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 font-bold text-sm tracking-wider text-white">
                TRD <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400 font-semibold">PRO</span>
              </div>
              <span className="text-[9px] text-slate-400 font-mono tracking-tight">WEB TERMINAL</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#markets" className="hover:text-white transition-colors">Markets</a>
            <a href="#charting" className="hover:text-white transition-colors">Advanced Charting</a>
            <a href="#risk" className="hover:text-white transition-colors">Risk Engine</a>
            <a href="#pricing" className="hover:text-white transition-colors">Plans</a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 border border-white/5 transition-all"
          >
            Sign In
          </Link>
          <Link
            href="/terminal"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-sky-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Terminal className="w-3.5 h-3.5" />
            Launch Terminal
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>

      {/* Global Footer */}
      <footer className="w-full bg-[#05080e] border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <span className="font-semibold text-xs tracking-wider text-slate-200">
              TRD PRO TERMINAL WORKSPACE
            </span>
          </div>

          <p className="text-[11px] text-slate-500 text-center md:text-left max-w-xl leading-relaxed">
            TRD Pro is an institutional-grade financial visualization platform and simulated paper trading terminal.
            Real-time quotes, technical analysis tools, and simulation engines are for analytical and educational purposes.
          </p>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Engine Online
            </span>
            <span>&copy; {new Date().getFullYear()} TRD Pro Monorepo. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

