'use client';

import React, { useEffect } from 'react';
import { WebHeader } from '@/components/WebHeader';
import { WebSidebarDock } from '@/components/WebSidebarDock';
import { WebCommandPalette } from '@/components/WebCommandPalette';
import { WebRiskCalculatorModal } from '@/components/WebRiskCalculatorModal';
import { useWebTerminalStore } from '@/stores/useWebTerminalStore';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { init } = useWebTerminalStore();

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="w-screen h-screen flex flex-col bg-[#070a11] text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Header */}
      <WebHeader />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Vertical Dock */}
        <WebSidebarDock />

        {/* Center Viewport */}
        <main className="flex-1 flex overflow-hidden relative">{children}</main>
      </div>

      {/* Global Modals */}
      <WebCommandPalette />
      <WebRiskCalculatorModal />
    </div>
  );
}

