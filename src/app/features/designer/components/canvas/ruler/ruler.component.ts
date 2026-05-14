// components/ruler/ruler.component.ts
import { Component, ElementRef, ViewChild, Input, effect, inject, computed, HostListener } from '@angular/core';
import { DesignerStateService } from '../../../services/editor-state.service';
export const CANVAS_MARGIN = 150; // 统一管理
@Component({
  selector: 'app-ruler',
  standalone: true,
  template: `
    <canvas #rulerCanvas></canvas>
  `,
  // styles: [`:host { display: block; width: 100%; height: 100%; } canvas { display: block; }`],
  styleUrl: './ruler.component.scss'
})
export class RulerComponent {
  @Input({ required: true }) type: 'h' | 'v' = 'h';
  @ViewChild('rulerCanvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;

  state = inject(DesignerStateService);

  private drawScheduled = false;

  constructor() {
    // 监听缩放和滚动，自动重绘
    effect(() => {
      this.state.scale();
      this.state.scrollX();
      this.state.scrollY();
      this.scheduleDraw();
    });
  }

  private scheduleDraw() {
    // if (this.drawScheduled) return;
    this.drawScheduled = true;

    requestAnimationFrame(() => {
      this.drawRuler();
      this.drawScheduled = false;
    });
  }

  private drawRuler() {
    console.log('12312', 1231);
    const canvasEl = this.canvas.nativeElement;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;

    const scale = this.state.scale();
    const isH = this.type === 'h';
    
    // 获取当前滚动位置（需确保 Service 中实时更新了这些值）
    const scrollPos = isH ? this.state.scrollX() : this.state.scrollY();

    // 1. 处理高分屏清晰度 (DPR)
    const dpr = window.devicePixelRatio || 1;
    const rect = canvasEl.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;


    // 2. 计算应该设置的物理像素值
    const targetWidth = Math.floor(rect.width * dpr);
    const targetHeight = Math.floor(rect.height * dpr);

    // 3. 只有当当前 Canvas 属性不等于目标大小时，才重新设置
    // 这一步直接覆盖了浏览器的默认值 (300x150)，并解决了缩放/窗口变动问题
    if (canvasEl.width !== targetWidth || canvasEl.height !== targetHeight) {
      canvasEl.width = targetWidth;
      canvasEl.height = targetHeight;
      
      // 每次改变 width/height 都会重置 context 状态，所以需要重新 scale
      ctx.scale(dpr, dpr);
    }
    
    ctx.resetTransform(); // 重置变换矩阵
    ctx.scale(dpr, dpr);  // 缩放上下文以匹配 DPR

    // 2. 绘制背景
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    // 3. 计算刻度步长
    // 逻辑间距 50px，随缩放动态调整显示间隔
    let step = 50;
    if (scale < 1) step = 100;
    if (scale < 0.5) step = 200;
    if (scale < 0.3) step = 400;

    // 4. 配置绘制样式
    ctx.beginPath();
    ctx.strokeStyle = '#555';
    ctx.fillStyle = '#888';
    ctx.font = '8px sans-serif';
    ctx.lineWidth = 1;
    if (isH) ctx.textBaseline = "middle"
    else ctx.textBaseline = 'top'

    // 计算偏移量：画布 Margin 的物理尺寸
    const scaledMargin = 150;
    const sortLineHeight = 6;
    const stepLineHeight = 8;

    // 5. 循环绘制刻度线
    for (let i = -CANVAS_MARGIN; i <= 5000; i += step) {
      // 核心公式：逻辑坐标 -> 物理缩放 -> 边距偏移 -> 滚动减法
      const drawPos = (i * scale) + scaledMargin - scrollPos;
      // const drawPos = ((i + scaledMargin) * scale) + 0 - scrollPos;

      // 性能优化：跳过视口外的绘制
      if (drawPos < -step * scale) continue;
      if (drawPos > (isH ? width : height) + step * scale) break;

      const isLongLine = i % (step * 2) === 0;
      const lineSize = isLongLine ? 0 : (isH ? height - 8 : width - 8);
      const text = (i * scale).toString();
      const metrics = ctx.measureText(text);
      if (isH) {
        // 绘制水平刻度 
        if (isLongLine) {
          Array.from({length: 10 * scale }, (k, v) => {
            if (v === 10 * scale - 1) {
              ctx.moveTo(drawPos, height - stepLineHeight);
              ctx.lineTo(drawPos, lineSize);
              const textY = rect.height / 2 + 6;
              ctx.fillText(text, drawPos + 2, textY);
            } else {
              let smallStep = 10;
              const idx = v + 1;
              const moveDrawPos = drawPos - idx * smallStep;
              console.log('smallStep', idx, smallStep, moveDrawPos);
              ctx.moveTo(moveDrawPos, 0);
              ctx.lineTo(moveDrawPos, sortLineHeight);
            }
          });
        }
      } else {
        // 绘制垂直刻度
        if (isLongLine) {
          ctx.moveTo(width - stepLineHeight, drawPos);
          ctx.lineTo(lineSize, drawPos);
          ctx.save();
          ctx.translate(10, drawPos - 2);
          ctx.rotate(-Math.PI / 2);
          ctx.fillText(text, 0, 0);
          ctx.restore();
        } else {
          Array.from({length: 9}, (k, v) => {
            const moveDrawPos = drawPos + (4 - v) * 10;
            // ctx.moveTo(width, moveDrawPos);
            // ctx.lineTo(lineSize, moveDrawPos);
            ctx.moveTo(0, moveDrawPos);
            ctx.lineTo(sortLineHeight, moveDrawPos);
          });
        }
      }
    }
    ctx.stroke();

    // 6. 绘制零点高亮线（可选）
    // ctx.beginPath();
    // ctx.strokeStyle = '#00e5ff';
    // const zeroPos = scaledMargin - scrollPos;
    // if (isH) {
    //   ctx.moveTo(zeroPos, 0); ctx.lineTo(zeroPos, height);
    // } else {
    //   ctx.moveTo(0, zeroPos); ctx.lineTo(width, zeroPos);
    // }
    // ctx.stroke();
  }
}