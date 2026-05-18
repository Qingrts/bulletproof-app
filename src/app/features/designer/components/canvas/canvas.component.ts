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
   * 修正：同步滚动方法
   * 必须使用 requestAnimationFrame 保证滚动的平滑度，避免标尺抖动
   */
  syncRulers(event: Event) {
    const viewport = event.target as HTMLElement;
    
    // 仅在值真正改变时才同步，减少渲染压力
    if (Math.abs(this.state.scrollX() - viewport.scrollLeft) > 0.5) {
        this.state.scrollX.set(viewport.scrollLeft);
    }
    if (Math.abs(this.state.scrollY() - viewport.scrollTop) > 0.5) {
        this.state.scrollY.set(viewport.scrollTop);
    }

    const hRuler = document.querySelector('.ruler-h-container');
    const vRuler = document.querySelector('.ruler-v-container');

    // 使用 requestAnimationFrame 是正确的，但要确保目标存在
    requestAnimationFrame(() => {
      if (hRuler && hRuler.scrollLeft !== viewport.scrollLeft) {
        hRuler.scrollLeft = viewport.scrollLeft;
      }
      if (vRuler && vRuler.scrollTop !== viewport.scrollTop) {
        vRuler.scrollTop = viewport.scrollTop;
      }
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

  // 获取 HTML 中的 viewport 引用
  @ViewChild('viewport', { static: true }) viewport!: ElementRef<HTMLElement>;

  private isPanning = false;
  private startX = 0;
  private startY = 0;
  private scrollLeft = 0;
  private scrollTop = 0;

  // 1. 监听空格按下
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // 1. 检查是否按下的是空格键
    if (event.code === 'Space') {
      const target = event.target as HTMLElement;
      
      // 2. 只有当焦点不在输入框、文本域或可编辑元素时，才拦截默认滚动
      const isInput = target.tagName === 'INPUT' || 
                      target.tagName === 'TEXTAREA' || 
                      target.isContentEditable;

      if (!isInput) {
        // 3. 关键：阻止浏览器默认的空格滚动行为
        event.preventDefault(); 
        
        // 4. 设置状态
        if (!this.state.isSpacePressed()) {
          this.state.isSpacePressed.set(true);
        }
      }
    }
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (event.code === 'Space') {
      this.state.isSpacePressed.set(false);
      this.stopPanning();
    }
  }

  // 3. 鼠标按下开始平移
  onPointerDown(e: PointerEvent) {
    if (!this.state.isSpacePressed()) return;
    
    this.isPanning = true;
    const el = this.viewport.nativeElement;
    
    // 记录初始位置
    this.startX = e.pageX - el.offsetLeft;
    this.startY = e.pageY - el.offsetTop;
    this.scrollLeft = el.scrollLeft;
    this.scrollTop = el.scrollTop;
    
    // 捕获指针，确保滑出画布也能继续拖拽
    el.setPointerCapture(e.pointerId);
  }

  // 4. 鼠标移动执行平移
  onPointerMove(e: PointerEvent) {
    if (!this.isPanning) return;

    const el = this.viewport.nativeElement;
    const x = e.pageX - el.offsetLeft;
    const y = e.pageY - el.offsetTop;
    
    // 计算移动距离
    const walkX = (x - this.startX);
    const walkY = (y - this.startY);
    
    // 直接更新原生滚动条位置
    el.scrollLeft = this.scrollLeft - walkX;
    el.scrollTop = this.scrollTop - walkY;
  }

  onPointerUp() {
    this.stopPanning();
  }

  private stopPanning() {
    this.isPanning = false;
  }
}