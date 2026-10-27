import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#070a11] text-slate-100 relative overflow-hidden">
      {/* Liquid background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md w-full p-8 rounded-2xl bg-[#0d131f]/70 backdrop-blur-2xl border border-white/10 text-center shadow-2xl">
        <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
          <Compass className="w-7 h-7 animate-spin-slow" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">404</h1>
        <h2 className="text-lg font-semibold text-slate-200 mb-3">Page Not Found</h2>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          The trading screen or resource you requested could not be located on the server.
        </p>
        <Link
          href="/terminal"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition-all shadow-lg shadow-sky-500/20"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Terminal
        </Link>
      </div>
    </div>
  );
}

