import type { ChartDrawing, DrawingPoint, DrawingType } from '@trd/contracts';
import type { ChartController } from '@trd/chart-core';
import { generateId, TypedEventEmitter } from '@trd/shared-utils';

export interface DrawingLayerEvents {
  drawingCreated: ChartDrawing;
  drawingSelected: ChartDrawing | null;
  drawingUpdated: ChartDrawing;
  drawingDeleted: string;
}

export class DrawingLayer extends TypedEventEmitter<DrawingLayerEvents> {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private chartController: ChartController;
  private drawings: ChartDrawing[] = [];
  private activeDrawingType: DrawingType | null = null;
  private tempPoints: DrawingPoint[] = [];
  private selectedDrawingId: string | null = null;
  private isDragging: boolean = false;
  private dragPointIndex: number = -1;
  private animationFrameId: number | null = null;

  constructor(canvas: HTMLCanvasElement, chartController: ChartController) {
    super();
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.chartController = chartController;

    this.bindEvents();
    this.startRenderLoop();
  }

  public setDrawings(drawings: ChartDrawing[]): void {
    this.drawings = [...drawings];
    this.requestRender();
  }

  public getDrawings(): ChartDrawing[] {
    return [...this.drawings];
  }

  public setActiveDrawingTool(type: DrawingType | null): void {
    this.activeDrawingType = type;
    this.tempPoints = [];
    this.canvas.style.cursor = type ? 'crosshair' : 'default';
  }

  public deleteSelected(): void {
    if (!this.selectedDrawingId) return;
    const id = this.selectedDrawingId;
    this.drawings = this.drawings.filter((d) => d.id !== id);
    this.selectedDrawingId = null;
    this.emit('drawingDeleted', id);
    this.emit('drawingSelected', null);
    this.requestRender();
  }

  private bindEvents(): void {
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    window.addEventListener('keydown', (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && this.selectedDrawingId) {
        this.deleteSelected();
      }
    });
  }

  private getPointFromEvent(e: MouseEvent): DrawingPoint | null {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const time = this.chartController.coordinateToTime(x);
    const price = this.chartController.coordinateToPrice(y);

    if (time === null || price === null) return null;
    return { time, price };
  }

  private handleMouseDown(e: MouseEvent): void {
    const pt = this.getPointFromEvent(e);
    if (!pt) return;

    if (this.activeDrawingType) {
      this.tempPoints.push(pt);
      const requiredPoints = this.getRequiredPointsForType(this.activeDrawingType);

      if (this.tempPoints.length >= requiredPoints) {
        const newDrawing: ChartDrawing = {
          id: generateId('draw'),
          symbol: '',
          type: this.activeDrawingType,
          points: [...this.tempPoints],
          style: {
            color: '#38bdf8',
            lineWidth: 2,
            lineStyle: 'solid',
            fillColor: 'rgba(56, 189, 248, 0.15)'
          },
          locked: false,
          visible: true
        };

        this.drawings.push(newDrawing);
        this.emit('drawingCreated', newDrawing);
        this.setActiveDrawingTool(null);
        this.selectedDrawingId = newDrawing.id;
        this.emit('drawingSelected', newDrawing);
      }
      this.requestRender();
      return;
    }

    // Hit test existing drawings
    const hit = this.hitTest(e);
    if (hit) {
      this.selectedDrawingId = hit.drawing.id;
      this.isDragging = true;
      this.dragPointIndex = hit.pointIndex;
      this.emit('drawingSelected', hit.drawing);
    } else {
      this.selectedDrawingId = null;
      this.emit('drawingSelected', null);
    }
    this.requestRender();
  }

  private handleMouseMove(e: MouseEvent): void {
    if (this.isDragging && this.selectedDrawingId) {
      const pt = this.getPointFromEvent(e);
      if (!pt) return;

      const drawing = this.drawings.find((d) => d.id === this.selectedDrawingId);
      if (drawing && this.dragPointIndex >= 0 && this.dragPointIndex < drawing.points.length) {
        drawing.points[this.dragPointIndex] = pt;
        this.emit('drawingUpdated', drawing);
        this.requestRender();
      }
    }
  }

  private handleMouseUp(): void {
    this.isDragging = false;
    this.dragPointIndex = -1;
  }

  private getRequiredPointsForType(type: DrawingType): number {
    switch (type) {
      case 'horizontal_line':
      case 'vertical_line':
      case 'text':
        return 1;
      case 'trendline':
      case 'ray':
      case 'fibonacci':
      case 'rectangle':
      case 'risk_reward_long':
      case 'risk_reward_short':
      default:
        return 2;
    }
  }

  private hitTest(e: MouseEvent): { drawing: ChartDrawing; pointIndex: number } | null {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (const d of this.drawings) {
      for (let i = 0; i < d.points.length; i++) {
        const pt = d.points[i];
        const cx = this.chartController.timeToCoordinate(pt.time);
        const cy = this.chartController.priceToCoordinate(pt.price);
        if (cx !== null && cy !== null) {
          const dist = Math.hypot(x - cx, y - cy);
          if (dist <= 10) {
            return { drawing: d, pointIndex: i };
          }
        }
      }
    }
    return null;
  }

  private startRenderLoop(): void {
    const render = () => {
      this.render();
      this.animationFrameId = requestAnimationFrame(render);
    };
    this.animationFrameId = requestAnimationFrame(render);
  }

  public requestRender(): void {
    this.render();
  }

  private render(): void {
    const width = this.canvas.width;
    const height = this.canvas.height;
    this.ctx.clearRect(0, 0, width, height);

    for (const d of this.drawings) {
      if (!d.visible) continue;
      this.renderDrawing(d, d.id === this.selectedDrawingId);
    }
  }

  private renderDrawing(d: ChartDrawing, isSelected: boolean): void {
    const coords = d.points.map((pt) => ({
      x: this.chartController.timeToCoordinate(pt.time),
      y: this.chartController.priceToCoordinate(pt.price)
    }));

    if (coords.some((c) => c.x === null || c.y === null)) return;

    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = d.style.color;
    ctx.lineWidth = d.style.lineWidth;

    if (d.type === 'trendline' && coords.length >= 2) {
      ctx.beginPath();
      ctx.moveTo(coords[0].x!, coords[0].y!);
      ctx.lineTo(coords[1].x!, coords[1].y!);
      ctx.stroke();
    } else if (d.type === 'horizontal_line' && coords.length >= 1) {
      ctx.beginPath();
      ctx.moveTo(0, coords[0].y!);
      ctx.lineTo(this.canvas.width, coords[0].y!);
      ctx.stroke();
    } else if (d.type === 'vertical_line' && coords.length >= 1) {
      ctx.beginPath();
      ctx.moveTo(coords[0].x!, 0);
      ctx.lineTo(coords[0].x!, this.canvas.height);
      ctx.stroke();
    } else if (d.type === 'rectangle' && coords.length >= 2) {
      const x = Math.min(coords[0].x!, coords[1].x!);
      const y = Math.min(coords[0].y!, coords[1].y!);
      const w = Math.abs(coords[0].x! - coords[1].x!);
      const h = Math.abs(coords[0].y! - coords[1].y!);
      ctx.fillStyle = d.style.fillColor || 'rgba(56, 189, 248, 0.15)';
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);
    } else if (d.type === 'fibonacci' && coords.length >= 2) {
      const y0 = coords[0].y!;
      const y1 = coords[1].y!;
      const dy = y1 - y0;
      const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
      const colors = ['#f43f5e', '#fb923c', '#fbbf24', '#34d399', '#38bdf8', '#818cf8', '#a78bfa'];

      levels.forEach((lvl, idx) => {
        const yLvl = y0 + dy * lvl;
        ctx.strokeStyle = colors[idx % colors.length];
        ctx.beginPath();
        ctx.moveTo(0, yLvl);
        ctx.lineTo(this.canvas.width, yLvl);
        ctx.stroke();

        ctx.fillStyle = colors[idx % colors.length];
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText(`Fib ${(lvl * 100).toFixed(1)}%`, 10, yLvl - 4);
      });
    }

    // Render selection handles
    if (isSelected) {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;

      for (const c of coords) {
        ctx.beginPath();
        ctx.arc(c.x!, c.y!, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  public destroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}
