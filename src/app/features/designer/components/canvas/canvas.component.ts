// pages/designer/components/canvas/canvas.component.ts
import { Component, ElementRef, ViewChild, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, CdkDropList, DragDropModule } from '@angular/cdk/drag-drop';
import { DesignerStateService } from '../../services/editor-state.service';
import { ResizeHandlerComponent } from "../resize-handlers/resize-handlers.component";
import { WIDGET_REGISTRY } from '../../configs/widget-registry';
import { RulerComponent } from "./ruler/ruler.component";

@Component({
  selector: 'app-designer-canvas',
  standalone: true,
  imports: [CommonModule, CdkDropList, ResizeHandlerComponent, DragDropModule, RulerComponent],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.scss'
})
export class CanvasComponent {
  state = inject(DesignerStateService);

  // 画布默认尺寸
  readonly CANVAS_WIDTH = 1920;
  readonly CANVAS_HEIGHT = 1080;

  @ViewChild('canvasBoard') canvasBoard!: ElementRef;
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

  getWidgetComponent(type: string) {
    const component = WIDGET_REGISTRY[type];
    if (!component) {
      console.warn(`未找到类型为 ${type} 的组件映射`);
    }
    return component;
  }

  onDrop(event: CdkDragDrop<any>) {
    // 1. 获取画布相对于视口的缩放比例
    const scale = this.state.scale();

    // 2. 获取画布板 (Board) 的位置信息
    // 如果你的 dragData 包含的是模板数据
    const template = event.item.data;

    // 3. 计算坐标
    // event.dropPoint 是鼠标在屏幕上的绝对坐标
    // 我们需要减去画布容器的左上角偏移，并除以缩放比例
    const rect = this.canvasBoard.nativeElement.getBoundingClientRect();

    const x = Math.round((event.dropPoint.x - rect.left) / scale);
    const y = Math.round((event.dropPoint.y - rect.top) / scale);

    // 4. 生成新组件并推送到全局状态
    this.state.widgets.update(widgets => [
      ...widgets,
      {
        id: crypto.randomUUID(), // 生成唯一ID
        type: template.type,
        name: template.name,
        x: x,
        y: y,
        w: template.defaultWidth || 400,
        h: template.defaultHeight || 300,
        zIndex: widgets.length + 1,
        config: { ...template.defaultConfig }
      }
    ]);
  }

  onScaleChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const newScale = parseFloat(input.value);

    // 更新 Signal，这将自动触发 template 中的 [style.transform] 更新
    this.state.scale.set(newScale);
  }

  onWidgetDragStart(id: string) {
    this.state.selectedId.set(id);
  }

  onWidgetDragging(event: any) {
    // 可以在这里实时更新参考线（辅助对齐）
  }

  onWidgetDragEnd(event: any, widget: any) {
    const scale = this.state.scale();

    // cdkDrag 提供的 distance 是基于屏幕像素的偏移量
    // 我们需要除以当前的 scale 才能换算成画布的逻辑坐标
    const deltaX = event.distance.x / scale;
    const deltaY = event.distance.y / scale;

    // 更新状态
    this.state.updateWidget(widget.id, {
      x: Math.round(widget.x + deltaX),
      y: Math.round(widget.y + deltaY)
    });

    // 重置 CDK 内部的位移记录，防止下次拖拽叠加错误
    event.source.reset();
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
}