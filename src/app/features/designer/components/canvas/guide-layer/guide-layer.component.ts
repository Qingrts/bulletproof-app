import { Component, ElementRef, ViewChild, inject, effect, HostBinding } from '@angular/core';
import { DesignerStateService } from '../../../services/editor-state.service';

@Component({
  selector: 'app-guide-layer',
  standalone: true,
  template: `<canvas #guideCanvas></canvas>`,
  styles: [`
    :host {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none; /* 确保不阻碍画布操作 */
      z-index: 10;
    }
    canvas { width: 100%; height: 100%; }
  `],
  imports: []
})
export class GuideLayerComponent {
  state = inject(DesignerStateService);
  @ViewChild('guideCanvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;

  constructor() {
    effect(() => {
      // 监听鼠标位置、滚动和缩放
      const hover = this.state.hoverPosition();
      const scrollX = this.state.scrollX();
      const scrollY = this.state.scrollY();
      const scale = this.state.scale();
      
      this.drawGuides(hover.x, hover.y, scale, scrollX, scrollY);
    });
  }

  private drawGuides(lx: number | null, ly: number | null, scale: number, sx: number, sy: number) {
    const canvasEl = this.canvas.nativeElement;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;

    // 同步物理尺寸 (Viewport 大小)
    const rect = canvasEl.getBoundingClientRect();
    if (canvasEl.width !== rect.width) {
      canvasEl.width = rect.width;
      canvasEl.height = rect.height;
    }

    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    if (lx === null && ly === null) return;

    ctx.save();
    ctx.setLineDash([1, 1]);
    ctx.strokeStyle = '#00e5ff'; 
    ctx.lineWidth = 1;
    
    const margin = 150;

    // 绘制垂直线 (基于鼠标在标尺上的逻辑 X)
    if (lx !== null) {
      // 公式必须与标尺一致：(逻辑坐标 * 缩放) + 偏移 - 滚动
      const physX = (lx * scale) + margin - sx;
      ctx.beginPath();
      ctx.moveTo(physX, 0);
      ctx.lineTo(physX, canvasEl.height);
      ctx.stroke();
    }

    // 绘制水平线 (基于鼠标在标尺上的逻辑 Y)
    if (ly !== null) {
      const physY = (ly * scale) + margin - sy;
      ctx.beginPath();
      ctx.moveTo(0, physY);
      ctx.lineTo(canvasEl.width, physY);
      ctx.stroke();
    }

    ctx.restore();
  }
}