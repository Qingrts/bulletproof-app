// components/ruler/ruler.component.ts
import { Component, ElementRef, ViewChild, Input, effect, inject, computed, HostListener } from '@angular/core';
import { DesignerStateService } from '../../../services/editor-state.service';
export const CANVAS_MARGIN = 150;

@Component({
  selector: 'app-ruler',
  standalone: true,
  template: `
    <canvas #rulerCanvas></canvas>
  `,
  styleUrl: './ruler.component.scss'
})
export class RulerComponent {
  @Input({ required: true }) type: 'h' | 'v' = 'h';
  @ViewChild('rulerCanvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;

  state = inject(DesignerStateService);
  private drawScheduled = false;

  constructor() {
    effect(() => {
      this.state.hoverPosition();
      this.state.scale();
      this.state.scrollX();
      this.state.scrollY();
      this.scheduleDraw();
    });
  }

  // @HostListener('mousemove', ['$event'])
  // onMouseMove(event: MouseEvent) {
  //   const rect = this.canvas.nativeElement.getBoundingClientRect();
  //   const scale = this.state.scale();
  //   const isH = this.type === 'h';
  //   const scrollPos = isH ? this.state.scrollX() : this.state.scrollY();

  //   // 1. 获取鼠标在 Canvas 上的物理坐标
  //   const physPos = isH ? event.clientX - rect.left : event.clientY - rect.top;

  //   // 2. 【核心修正】反推逻辑坐标
  //   // 基于你的公式：physPos = (logicPos * scale) + 150 - scrollPos
  //   // 逆推得到：logicPos = (physPos + scrollPos - 150) / scale
  //   const logicPos = (physPos + scrollPos - CANVAS_MARGIN) / scale;

  //   if (isH) {
  //     this.state.hoverPosition.update(p => ({ ...p, x: logicPos }));
  //   } else {
  //     this.state.hoverPosition.update(p => ({ ...p, y: logicPos }));
  //   }
  // }

  // // 鼠标移出时隐藏
  // @HostListener('mouseleave')
  // onMouseLeave() {
  //   this.state.hoverPosition.set({ x: null, y: null });
  // }

  private scheduleDraw() {
    this.drawScheduled = true;
    requestAnimationFrame(() => {
      this.drawRuler();
      this.drawScheduled = false;
    });
  }

  private drawRuler() {
    const canvasEl = this.canvas.nativeElement;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;

    const scale = this.state.scale();
    const isH = this.type === 'h';
    const scrollPos = isH ? this.state.scrollX() : this.state.scrollY();

    // 处理高分屏清晰度
    const dpr = window.devicePixelRatio || 1;
    const rect = canvasEl.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // 设置 Canvas 物理像素尺寸
    const targetWidth = Math.floor(rect.width * dpr);
    const targetHeight = Math.floor(rect.height * dpr);

    if (canvasEl.width !== targetWidth || canvasEl.height !== targetHeight) {
      canvasEl.width = targetWidth;
      canvasEl.height = targetHeight;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    } else {
      ctx.resetTransform();
      ctx.scale(dpr, dpr);
    }

    // 绘制背景
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    // 计算刻度步长
    const step = this.calculateStep(scale);

    // 配置绘制样式
    ctx.beginPath();
    ctx.strokeStyle = '#555';
    ctx.fillStyle = '#888';
    ctx.font = '9px sans-serif';
    ctx.lineWidth = 1;

    if (isH) {
      ctx.textBaseline = "middle";
      this.drawHorizontalRuler(ctx, width, height, scale, scrollPos, step);
    } else {
      ctx.textBaseline = 'top';
      this.drawVerticalRuler(ctx, width, height, scale, scrollPos, step);
    }

    ctx.stroke();

    this.drawMouseGuide(ctx, width, height, scale, scrollPos);
  }

  private calculateStep(scale: number): number {
    if (scale < 0.3) return 400;
    if (scale < 0.5) return 200;
    if (scale < 1) return 100;
    return 50;
  }

  // 绘制水平标尺（包含主刻度和子刻度）
  private drawHorizontalRuler(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    scale: number,
    scrollPos: number,
    step: number
  ) {
    const longLineHeight = height - 8;
    const shortLineHeight = height - 12;
    const textY = height / 2 + 6;

    // 计算需要绘制的逻辑起始位置（考虑边距和滚动）
    const startLogical = Math.floor((scrollPos - CANVAS_MARGIN) / scale);
    const endLogical = startLogical + Math.ceil(width / scale) + step;

    // 主刻度步长
    const mainStep = step;
    // 子刻度步长（10等分）
    const subStep = step / 10;

    // 找到第一个主刻度的位置
    let firstMainTick = Math.ceil(startLogical / mainStep) * mainStep;

    // 遍历所有刻度（包括主刻度和子刻度）
    for (let logicalPos = firstMainTick - mainStep; logicalPos <= endLogical + mainStep; logicalPos += subStep) {
      // 计算绘制位置
      const drawPos = (logicalPos * scale) + CANVAS_MARGIN - scrollPos;

      // 超出画布范围则跳过
      if (drawPos < -10 || drawPos > width + 10) continue;

      // 判断是否是主刻度（能被 step 整除）
      const isMainTick = Math.abs(logicalPos % mainStep) < 0.0001; // 浮点数精度处理

      if (isMainTick) {
        // 绘制主刻度线（长线）
        ctx.moveTo(drawPos, longLineHeight - 2);
        ctx.lineTo(drawPos, 0);

        // 显示刻度数值
        const displayValue = Math.round(logicalPos * scale);
        ctx.fillText(displayValue.toString(), drawPos + 2, textY);
      } else {
        // 绘制子刻度线（短线）
        ctx.moveTo(drawPos, longLineHeight - 6);
        ctx.lineTo(drawPos, 0);
      }
    }
  }

  // 绘制垂直标尺（包含主刻度和子刻度）
  private drawVerticalRuler(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    scale: number,
    scrollPos: number,
    step: number
  ) {
    const longLineWidth = width - 8;
    const shortLineWidth = width - 12;

    // 计算需要绘制的逻辑起始位置
    const startLogical = Math.floor((scrollPos - CANVAS_MARGIN) / scale);
    const endLogical = startLogical + Math.ceil(height / scale) + step;

    const mainStep = step;
    const subStep = step / 10;

    let firstMainTick = Math.ceil(startLogical / mainStep) * mainStep;

    for (let logicalPos = firstMainTick - mainStep; logicalPos <= endLogical + mainStep; logicalPos += subStep) {
      const drawPos = (logicalPos * scale) + CANVAS_MARGIN - scrollPos;

      if (drawPos < -10 || drawPos > height + 10) continue;

      const isMainTick = Math.abs(logicalPos % mainStep) < 0.0001;

      if (isMainTick) {
        // 绘制主刻度线
        ctx.moveTo(longLineWidth - 2, drawPos);
        ctx.lineTo(0, drawPos);

        // 显示刻度数值（旋转90度）
        const displayValue = Math.round(logicalPos * scale);
        ctx.save();
        ctx.translate(10, drawPos - 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(displayValue.toString(), 0, 0);
        ctx.restore();
      } else {
        // 绘制子刻度线
        ctx.moveTo(longLineWidth - 6, drawPos);
        ctx.lineTo(0, drawPos);
      }
    }

  }

  private drawMouseGuide(ctx: CanvasRenderingContext2D, width: number, height: number, scale: number, scrollPos: number) {
    const hover = this.state.hoverPosition();
    const logicPos = this.type === 'h' ? hover.x : hover.y;

    // 只有当坐标有效时才绘制
    if (logicPos !== null && logicPos !== undefined) {
      // 使用正向公式算出最终绘制在屏幕上的物理位置
      const drawPos = (logicPos * scale) + CANVAS_MARGIN - scrollPos;

      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = '#00e5ff'; // 辅助线颜色
      ctx.lineWidth = 1;

      // --- 设置虚线模式 [虚线长度, 间隙长度] ---
      ctx.setLineDash([1, 1]);

      if (this.type === 'h') {
        // 水平标尺画垂直线
        ctx.moveTo(drawPos, 0);
        ctx.lineTo(drawPos, height);
        ctx.stroke();

        // 绘制数值
        ctx.setLineDash([]); // 关闭虚线画文字
        ctx.fillStyle = '#00e5ff';
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';
        // 在线右侧显示数值
        ctx.fillText(Math.round(logicPos).toString(), drawPos + 5, 2);
      } else {
        // 垂直标尺画水平线
        ctx.moveTo(0, drawPos);
        ctx.lineTo(width, drawPos);
        ctx.stroke();

        // 绘制数值
        ctx.setLineDash([]);
        ctx.fillStyle = '#00e5ff';
        ctx.textBaseline = 'bottom';
        ctx.textAlign = 'left';
        // 在线上方显示数值
        ctx.fillText(Math.round(logicPos).toString(), 2, drawPos - 2);
      }

      ctx.restore();
    }
  }
}