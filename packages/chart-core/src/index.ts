import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type Time,
  ColorType,
  CrosshairMode,
  LineStyle,
  CandlestickSeries,
  LineSeries,
  AreaSeries,
  HistogramSeries
} from 'lightweight-charts';
import type { Candle, Timeframe } from '@trd/contracts';
import { colors } from '@trd/design-system';

export type ChartSeriesType = 'candlestick' | 'line' | 'area' | 'heikin_ashi' | 'bars';

export interface ChartControllerOptions {
  container: HTMLElement;
  theme?: 'dark' | 'light';
  onCrosshairMove?: (param: { time?: number; price?: number }) => void;
}

export class ChartController {
  private chart: IChartApi;
  private mainSeries: ISeriesApi<'Candlestick'> | ISeriesApi<'Line'> | ISeriesApi<'Area'>;
  private volumeSeries: ISeriesApi<'Histogram'>;
  private theme: 'dark' | 'light';
  private resizeObserver: ResizeObserver;

  constructor(options: ChartControllerOptions) {
    this.theme = options.theme || 'dark';
    const themeColors = colors[this.theme];

    this.chart = createChart(options.container, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: themeColors.textSecondary,
        fontSize: 11,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      },
      grid: {
        vertLines: { color: themeColors.gridColor },
        horzLines: { color: themeColors.gridColor }
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: themeColors.crosshairColor,
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: themeColors.bgPanel
        },
        horzLine: {
          color: themeColors.crosshairColor,
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: themeColors.bgPanel
        }
      },
      rightPriceScale: {
        borderColor: themeColors.borderSubtle,
        scaleMargins: { top: 0.1, bottom: 0.2 },
        autoScale: true
      },
      timeScale: {
        borderColor: themeColors.borderSubtle,
        timeVisible: true,
        secondsVisible: false
      }
    });

    // 1. Candlestick series
    this.mainSeries = this.chart.addSeries(CandlestickSeries, {
      upColor: themeColors.bull,
      downColor: themeColors.bear,
      borderUpColor: themeColors.bull,
      borderDownColor: themeColors.bear,
      wickUpColor: themeColors.bull,
      wickDownColor: themeColors.bear
    });

    // 2. Volume series
    this.volumeSeries = this.chart.addSeries(HistogramSeries, {
      color: themeColors.accentMuted,
      priceFormat: { type: 'volume' },
      priceScaleId: '', // overlay
      priceLineVisible: false
    });
    this.volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 }
    });

    if (options.onCrosshairMove) {
      this.chart.subscribeCrosshairMove((param) => {
        if (!param.point || !param.time) {
          options.onCrosshairMove?.({});
          return;
        }
        const price = param.seriesData.get(this.mainSeries) as any;
        options.onCrosshairMove?.({
          time: param.time as number,
          price: price?.close !== undefined ? price.close : price?.value
        });
      });
    }

    // Auto-resize
    this.resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      this.chart.applyOptions({ width, height });
    });
    this.resizeObserver.observe(options.container);
  }

  public getChart(): IChartApi {
    return this.chart;
  }

  public getMainSeries(): any {
    return this.mainSeries;
  }

  public setData(candles: Candle[]): void {
    const formattedCandles: CandlestickData<Time>[] = candles.map((c) => ({
      time: c.time as Time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close
    }));

    const formattedVolume = candles.map((c) => {
      const isUp = c.close >= c.open;
      const themeColors = colors[this.theme];
      return {
        time: c.time as Time,
        value: c.volume,
        color: isUp ? themeColors.bullMuted : themeColors.bearMuted
      };
    });

    (this.mainSeries as any).setData(formattedCandles);
    this.volumeSeries.setData(formattedVolume as any);
  }

  public updateCandle(candle: Candle): void {
    const themeColors = colors[this.theme];
    (this.mainSeries as any).update({
      time: candle.time as Time,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close
    });

    const isUp = candle.close >= candle.open;
    this.volumeSeries.update({
      time: candle.time as Time,
      value: candle.volume,
      color: isUp ? themeColors.bullMuted : themeColors.bearMuted
    });
  }

  public setTheme(theme: 'dark' | 'light'): void {
    this.theme = theme;
    const themeColors = colors[theme];

    this.chart.applyOptions({
      layout: { textColor: themeColors.textSecondary },
      grid: {
        vertLines: { color: themeColors.gridColor },
        horzLines: { color: themeColors.gridColor }
      },
      crosshair: {
        vertLine: {
          color: themeColors.crosshairColor,
          labelBackgroundColor: themeColors.bgPanel
        },
        horzLine: {
          color: themeColors.crosshairColor,
          labelBackgroundColor: themeColors.bgPanel
        }
      },
      rightPriceScale: { borderColor: themeColors.borderSubtle },
      timeScale: { borderColor: themeColors.borderSubtle }
    });

    this.mainSeries.applyOptions({
      upColor: themeColors.bull,
      downColor: themeColors.bear,
      borderUpColor: themeColors.bull,
      borderDownColor: themeColors.bear,
      wickUpColor: themeColors.bull,
      wickDownColor: themeColors.bear
    } as any);
  }

  public timeToCoordinate(time: number): number | null {
    return this.chart.timeScale().timeToCoordinate(time as Time);
  }

  public coordinateToTime(x: number): number | null {
    return (this.chart.timeScale().coordinateToTime(x) as number) || null;
  }

  public priceToCoordinate(price: number): number | null {
    return (this.mainSeries as any).priceToCoordinate(price);
  }

  public coordinateToPrice(y: number): number | null {
    return (this.mainSeries as any).coordinateToPrice(y);
  }

  public destroy(): void {
    this.resizeObserver.disconnect();
    this.chart.remove();
  }
}
