import React, { useEffect, useRef, useState } from 'react';
import {
  MousePointer,
  TrendingUp,
  Minus,
  Maximize2,
  Trash2,
  Sliders,
  Layers,
  Activity,
  Maximize,
  Sparkles
} from 'lucide-react';
import type { Candle, DrawingType } from '@trd/contracts';
import { ChartController } from '@trd/chart-core';
import { DrawingLayer } from '@trd/chart-drawings';
import { LiveCandleAggregator } from '@trd/market-data';
import { formatPrice, formatPercent } from '@trd/shared-utils';
import { useTerminalStore } from '../stores/useTerminalStore.js';

interface ChartPanelProps {
  symbol: string;
  timeframe: string;
  isPrimary?: boolean;
}

export const SingleChartPanel: React.FC<ChartPanelProps> = ({
  symbol,
  timeframe,
  isPrimary = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartControllerRef = useRef<ChartController | null>(null);
  const drawingLayerRef = useRef<DrawingLayer | null>(null);
  const aggregatorRef = useRef<LiveCandleAggregator | null>(null);

  const {
    marketProvider,
    settings,
    activeDrawingTool,
    drawings,
    indicators,
    setActiveDrawingTool,
    addDrawing,
    deleteDrawing,
    toggleIndicator
  } = useTerminalStore();

  const [hoverData, setHoverData] = useState<{
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    change?: number;
  }>({});

  const [indicatorMenuOpen, setIndicatorMenuOpen] = useState(false);

  // Initialize Chart
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const controller = new ChartController({
      container: containerRef.current,
      theme: settings.theme === 'light' ? 'light' : 'dark',
      onCrosshairMove: ({ price }) => {
        if (price) {
          setHoverData((prev) => ({ ...prev, close: price }));
        }
      }
    });
    chartControllerRef.current = controller;

    // Adjust canvas resolution
    const resizeCanvas = () => {
      if (canvasRef.current && containerRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
        drawingLayerRef.current?.requestRender();
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize Drawing Layer
    const drawingLayer = new DrawingLayer(canvasRef.current, controller);
    drawingLayerRef.current = drawingLayer;

    drawingLayer.on('drawingCreated', (d) => {
      addDrawing(d);
    });

    drawingLayer.on('drawingDeleted', (id) => {
      deleteDrawing(id);
    });

    // Load initial historical candles
    let isMounted = true;
    marketProvider.getHistoricalCandles(symbol, timeframe as any, 200).then((candles) => {
      if (!isMounted) return;
      controller.setData(candles);

      if (candles.length > 0) {
        const last = candles[candles.length - 1];
        setHoverData({
          open: last.open,
          high: last.high,
          low: last.low,
          close: last.close,
          change: ((last.close - last.open) / last.open) * 100
        });

        // Initialize aggregator
        const agg = new LiveCandleAggregator(timeframe as any, (updatedCandle) => {
          controller.updateCandle(updatedCandle);
        });
        agg.setInitialCandle(last);
        aggregatorRef.current = agg;
      }
    });

    // Subscribe to live ticks
    const unsubTicks = marketProvider.subscribeTicks(symbol, (tick) => {
      aggregatorRef.current?.processTick(tick);
    });

    return () => {
      isMounted = false;
      unsubTicks();
      window.removeEventListener('resize', resizeCanvas);
      drawingLayer.destroy();
      controller.destroy();
    };
  }, [symbol, timeframe, settings.theme]);

  // Sync drawings
  useEffect(() => {
    if (drawingLayerRef.current) {
      drawingLayerRef.current.setDrawings(drawings);
    }
  }, [drawings]);

  // Sync active drawing tool
  useEffect(() => {
    if (drawingLayerRef.current) {
      drawingLayerRef.current.setActiveDrawingTool(activeDrawingTool);
    }
  }, [activeDrawingTool]);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#0b0f19] overflow-hidden select-none">
      {/* Top Chart Toolbar: Symbol info & Hover metrics & Indicator Menu */}
      <div className="h-8 w-full flex items-center justify-between px-3 bg-white/5 border-b border-white/5 text-xs z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-slate-200">
            <span className="font-mono">{symbol}</span>
            <span className="text-[10px] text-slate-400 font-mono">[{timeframe}]</span>
          </div>

          {hoverData.close !== undefined && (
            <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-slate-400">
              <span>O: <strong className="text-slate-200">{formatPrice(hoverData.open || 0)}</strong></span>
              <span>H: <strong className="text-slate-200">{formatPrice(hoverData.high || 0)}</strong></span>
              <span>L: <strong className="text-slate-200">{formatPrice(hoverData.low || 0)}</strong></span>
              <span>C: <strong className="text-slate-200">{formatPrice(hoverData.close || 0)}</strong></span>
              {hoverData.change !== undefined && (
                <span className={hoverData.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {formatPercent(hoverData.change)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Indicators Trigger */}
        <div className="relative flex items-center gap-1">
          <button
            onClick={() => setIndicatorMenuOpen(!indicatorMenuOpen)}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] transition-all cursor-pointer"
          >
            <Sliders className="w-3 h-3 text-sky-400" />
            <span>Indicators ({indicators.length})</span>
          </button>

          {indicatorMenuOpen && (
            <div className="absolute top-full right-0 mt-1 w-48 bg-[#0f172a]/95 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl p-1.5 z-50">
              <div className="text-[10px] font-medium text-slate-400 px-2 py-1">Technical Indicators</div>
              {['SMA', 'EMA', 'RSI', 'MACD', 'BB', 'ATR', 'SUPERTREND'].map((ind) => {
                const isActive = indicators.some((i) => i.type === ind);
                return (
                  <button
                    key={ind}
                    onClick={() => toggleIndicator(ind)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      isActive ? 'bg-sky-500/20 text-sky-400 font-medium' : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <span>{ind}</span>
                    <span className="text-[10px] text-slate-500">{isActive ? 'Active' : 'Add'}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Chart Body + Left Drawing Toolbar */}
      <div className="relative flex-1 w-full h-[calc(100%-2rem)] flex">
        {/* Left Floating Drawing Toolbar (Primary Chart only) */}
        {isPrimary && (
          <div className="absolute top-3 left-3 flex flex-col items-center gap-1 p-1 rounded-xl bg-[#090d16]/85 backdrop-blur-xl border border-white/10 shadow-xl z-20">
            <button
              onClick={() => setActiveDrawingTool(null)}
              title="Cursor / Select"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                activeDrawingTool === null ? 'bg-sky-500/25 text-sky-400' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <MousePointer className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveDrawingTool('trendline')}
              title="Trendline (2 points)"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                activeDrawingTool === 'trendline' ? 'bg-sky-500/25 text-sky-400' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveDrawingTool('horizontal_line')}
              title="Horizontal Price Line"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                activeDrawingTool === 'horizontal_line' ? 'bg-sky-500/25 text-sky-400' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Minus className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveDrawingTool('fibonacci')}
              title="Fibonacci Retracement (2 points)"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                activeDrawingTool === 'fibonacci' ? 'bg-sky-500/25 text-sky-400' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Activity className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveDrawingTool('rectangle')}
              title="Rectangle Zone (2 points)"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                activeDrawingTool === 'rectangle' ? 'bg-sky-500/25 text-sky-400' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Maximize className="w-4 h-4" />
            </button>

            <div className="w-full h-[1px] bg-white/10 my-0.5" />

            <button
              onClick={() => drawingLayerRef.current?.deleteSelected()}
              title="Delete Selected Drawing (Del)"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Lightweight Charts DOM Container */}
        <div ref={containerRef} className="relative w-full h-full">
          {/* Overlay Interactive Drawing Canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-auto z-10"
          />
        </div>
      </div>
    </div>
  );
};

export const ChartWorkspace: React.FC = () => {
  const { activeSymbol, activeTimeframe, chartLayout } = useTerminalStore();

  if (chartLayout === '1x1') {
    return (
      <div className="w-full h-full rounded-xl overflow-hidden border border-white/10">
        <SingleChartPanel symbol={activeSymbol} timeframe={activeTimeframe} isPrimary={true} />
      </div>
    );
  }

  if (chartLayout === '1x2') {
    return (
      <div className="w-full h-full grid grid-cols-2 gap-1.5 rounded-xl overflow-hidden">
        <div className="h-full border border-white/10 rounded-xl overflow-hidden">
          <SingleChartPanel symbol={activeSymbol} timeframe={activeTimeframe} isPrimary={true} />
        </div>
        <div className="h-full border border-white/10 rounded-xl overflow-hidden">
          <SingleChartPanel symbol="ETH/USD" timeframe={activeTimeframe} isPrimary={false} />
        </div>
      </div>
    );
  }

  if (chartLayout === '2x1') {
    return (
      <div className="w-full h-full grid grid-rows-2 gap-1.5 rounded-xl overflow-hidden">
        <div className="w-full border border-white/10 rounded-xl overflow-hidden">
          <SingleChartPanel symbol={activeSymbol} timeframe={activeTimeframe} isPrimary={true} />
        </div>
        <div className="w-full border border-white/10 rounded-xl overflow-hidden">
          <SingleChartPanel symbol="ETH/USD" timeframe="1h" isPrimary={false} />
        </div>
      </div>
    );
  }

  // 2x2 Grid
  return (
    <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-1.5 rounded-xl overflow-hidden">
      <div className="border border-white/10 rounded-xl overflow-hidden">
        <SingleChartPanel symbol={activeSymbol} timeframe={activeTimeframe} isPrimary={true} />
      </div>
      <div className="border border-white/10 rounded-xl overflow-hidden">
        <SingleChartPanel symbol="ETH/USD" timeframe="15m" isPrimary={false} />
      </div>
      <div className="border border-white/10 rounded-xl overflow-hidden">
        <SingleChartPanel symbol="SOL/USD" timeframe="1h" isPrimary={false} />
      </div>
      <div className="border border-white/10 rounded-xl overflow-hidden">
        <SingleChartPanel symbol="AAPL" timeframe="1D" isPrimary={false} />
      </div>
    </div>
  );
};
