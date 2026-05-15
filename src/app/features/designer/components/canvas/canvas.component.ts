// pages/designer/components/canvas/canvas.component.ts
import { Component, ElementRef, ViewChild, inject, HostListener, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, CdkDropList, DragDropModule } from '@angular/cdk/drag-drop';
import { DesignerStateService } from '../../services/editor-state.service';
import { ResizeHandlerComponent } from "../resize-handlers/resize-handlers.component";
import { WIDGET_REGISTRY } from '../../configs/widget-registry';
import { RulerComponent } from "./ruler/ruler.component";
import { CanvasBoardComponent } from "./board/canvas-board.component";
import { GuideLayerComponent } from './guide-layer/guide-layer.component';

@Component({
  selector: 'app-designer-canvas',
  standalone: true,
  imports: [CommonModule, DragDropModule, RulerComponent, CanvasBoardComponent, GuideLayerComponent],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.scss'
})
export class CanvasComponent {
  state = inject(DesignerStateService);


  viewport: any;

  // 监听 Ctrl + 滚轮实现缩放
  @HostListener('wheel', ['$event'])
  onMouseWheel(event: WheelEvent) {
    // 只有按住 Ctrl 键时才触发缩放
    if (event.ctrlKey) {
      event.preventDefault(); // 阻止浏览器默认的整体页面缩放

      const delta = event.deltaY > 0 ? -0.1 : 0.1;
      const currentScale = this.state.scale();

      // 限制缩放范围在 0.1 到 3 之间
      const newScale = Math.min(Math.max(0.1, currentScale + delta), 2);

      this.state.scale.set(newScale);
    }
    // 如果不按 Ctrl，则保留默认滚轮行为，用于画布垂直/水平滚动
  }

  // 取消选中
  onCanvasClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.state.selectedId.set(null);
    }
  }


  onScaleChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const newScale = parseFloat(input.value);

    // 更新 Signal，这将自动触发 template 中的 [style.transform] 更新
    this.state.scale.set(newScale);
  }

  

  /**
   * 标尺同步核心逻辑：
   * 我们主要通过 syncRulers 处理从画布到标尺的单向同步。
   * onScrollH/V 则是为了捕获标尺容器可能发生的意外滚动并强制对齐。
   */

  onScrollH(event: Event) {
    const el = event.target as HTMLElement;
    // 如果用户通过某种方式滚动了水平标尺，同步给画布视口
    if (this.viewport?.nativeElement) {
      this.viewport.nativeElement.scrollLeft = el.scrollLeft;
    }
  }

  onScrollV(event: Event) {
    const el = event.target as HTMLElement;
    // 同步给画布视口
    if (this.viewport?.nativeElement) {
      this.viewport.nativeElement.scrollTop = el.scrollTop;
    }
  }

  /**
   * 修正：同步滚动方法
   * 必须使用 requestAnimationFrame 保证滚动的平滑度，避免标尺抖动
   */
  syncRulers(event: Event) {
    const viewport = event.target as HTMLElement;
    const el = viewport;

    this.state.scrollX.set(viewport.scrollLeft);
    this.state.scrollY.set(viewport.scrollTop);

    const hRuler = document.querySelector('.ruler-h-container');
    const vRuler = document.querySelector('.ruler-v-container');

    requestAnimationFrame(() => {
      if (hRuler) hRuler.scrollLeft = el.scrollLeft;
      if (vRuler) vRuler.scrollTop = el.scrollTop;
    });
  }


  // 计算网格背景样式
  gridStyle = computed(() => {
    const config = this.state.canvasConfig();
    if (!config.showGrid) return { 'background-image': 'none' };

    const size = config.gridSize;
    const color = config.gridColor;
    
    // 使用双重线性渐变绘制十字网格
    return {
      'background-image': `
        linear-gradient(${color} 1px, transparent 1px),
        linear-gradient(90deg, ${color} 1px, transparent 1px)
      `,
      'background-size': `${size}px ${size}px`,
      'background-color': config.background
    };
  });
}