import Link from 'next/link';
import { Activity } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#070a11] text-slate-100 relative overflow-hidden">
      {/* Background ambient liquid blur */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="h-16 px-6 flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-500 p-[1px]">
            <div className="w-full h-full bg-[#070a11] rounded-[7px] flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-sky-400" />
            </div>
          </div>
          <span className="font-bold text-xs tracking-wider text-white">TRD PRO</span>
        </Link>
        <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors">
          &larr; Back to Home
        </Link>
      </header>

      {/* Center Form Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 z-10">{children}</main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-slate-500 z-10">
        &copy; {new Date().getFullYear()} TRD Pro. End-to-end encrypted session management.
      </footer>
    </div>
  );
}

