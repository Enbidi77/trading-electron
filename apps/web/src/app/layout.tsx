import type { Metadata, Viewport } from 'next';
import './globals.css';
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';

export const metadata: Metadata = {
  title: 'TRD Pro — Professional Liquid Glass Web Trading Terminal',
  description:
    'Institutional-grade browser-based trading workstation featuring interactive lightweight charting, real-time depth of market (DOM), vector technical drawings, indicators, risk management, and multi-asset paper trading.',
  keywords: [
    'trading terminal',
    'web trading',
    'financial charts',
    'lightweight-charts',
    'paper trading',
    'liquid glass',
    'technical analysis'
  ],
  authors: [{ name: 'TRD Pro Engineering Team' }]
};

export const viewport: Viewport = {
  themeColor: '#070a11',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#070a11] text-slate-100 font-sans antialiased overflow-x-hidden selection:bg-sky-500/30 selection:text-sky-200">
        <QueryProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

