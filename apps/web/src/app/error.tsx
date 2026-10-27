'use client';

import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#070a11] text-slate-100">
      <div className="max-w-md w-full p-8 rounded-2xl bg-[#0d131f]/80 backdrop-blur-2xl border border-rose-500/20 text-center shadow-2xl">
        <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold mb-2">Workspace Encountered an Error</h2>
        <p className="text-xs text-slate-400 mb-6 font-mono bg-black/40 p-3 rounded-lg border border-white/5 break-words">
          {error.message || 'An unexpected rendering error occurred'}
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-semibold text-xs transition-all shadow-lg shadow-rose-500/20 cursor-pointer"
        >
          <RefreshCcw className="w-4 h-4" />
          Reload Workspace
        </button>
      </div>
    </div>
  );
}

