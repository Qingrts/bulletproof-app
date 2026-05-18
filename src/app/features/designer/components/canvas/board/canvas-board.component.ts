import { Component, ElementRef, ViewChild, inject, effect, computed, signal } from '@angular/core';
import { CanvasElement, DesignerStateService } from '../../../services/editor-state.service';
import { CdkDragDrop, CdkDropList, DragDropModule } from '@angular/cdk/drag-drop';
import { ResizeHandlerComponent } from '../../resize-handlers/resize-handlers.component';
import { WIDGET_REGISTRY } from '../../../configs/widget-registry';
import { CommonModule, NgComponentOutlet } from '@angular/common';

// 在创建新元素（如 onDrop）时
const defaultFilterProps = {
  hue: 0,
  saturation: 100,
  brightness: 100,
  contrast: 100,
  opacity: 100,
  filterOn: false
};

@Component({
  selector: 'app-canvas-board',
  standalone: true,
  templateUrl: './canvas-board.component.html',
  styles: [`
    .board-container {
      background: #ffffff;
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
      position: relative;
    }
    canvas { display: block; width: 100%; height: 100%; }
  `],
  styleUrl: './canvas-board.component.scss',
  imports: [ResizeHandlerComponent, DragDropModule, NgComponentOutlet, CommonModule]
})
export class CanvasBoardComponent {
  state = inject(DesignerStateService);
  @ViewChild('canvasBoard') canvasBoard!: ElementRef;


  // 画布默认尺寸
  readonly CANVAS_WIDTH = 1920;
  readonly CANVAS_HEIGHT = 1080;

  constructor() {
    // 监听状态变化（缩放、鼠标悬停位置）

  }


  onWidgetDragStart(id: string) {
    this.state.setDragging(true);
    this.state.selectedId.set(id);
  }

  onWidgetDragging(event: any) {
    console.log('event', event);
    // 可以在这里实时更新参考线（辅助对齐）
  }

  onWidgetDragEnd(event: any, widget: any) {
    this.state.setDragging(false);
    const scale = this.state.scale();

    // cdkDrag 提供的 distance 是基于屏幕像素的偏移量
    // 我们需要除以当前的 scale 才能换算成画布的逻辑坐标
    const deltaX = event.distance.x / scale;
    const deltaY = event.distance.y / scale;

    // 更新状态
    this.state.updateElement(widget.id, {
      x: Math.round(widget.x + deltaX),
      y: Math.round(widget.y + deltaY)
    });
    console.log(`onWidgetDragEnd`, {
      x: Math.round(widget.x + deltaX),
      y: Math.round(widget.y + deltaY)
    })
    // 重置 CDK 内部的位移记录，防止下次拖拽叠加错误
    event.source.reset();
  }

  onDragOver(event: DragEvent) {
    event.preventDefault(); // 必须调用，否则 drop 不会触发
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const dataString = event.dataTransfer?.getData('application/json');
    if (!dataString) return;

    const data = JSON.parse(dataString);
    const rect = this.canvasBoard.nativeElement.getBoundingClientRect();

    // 1. 获取鼠标相对于画布可视区域的物理坐标
    const physX = event.clientX - rect.left;
    const physY = event.clientY - rect.top;

    // 2. 【核心】转换逻辑坐标
    // 公式与标尺对应：logic = (phys + scroll - margin) / scale
    // 注意：如果你的 CanvasBoard 已经在 margin 150 的容器内，这里可能不需要减 150，视 CSS 结构而定
    const scale = this.state.scale();
    const scrollX = this.state.scrollX();
    const scrollY = this.state.scrollY();

    const logicX = (physX + scrollX) / scale;
    const logicY = (physY + scrollY) / scale;

    // 2. 使用从资产库传来的尺寸
    const w = data.defaultWidth;
    const h = data.defaultHeight;
    

    // 3. 创建并添加新元素
    const newElement: CanvasElement = {
      id: Date.now().toString(),
      type: data.type,
      name: data.name,
      x: logicX - 50, // 减去宽度一半，让鼠标位于中心
      y: logicY - 25,
      width: w,
      height: h,
      config: {
        xAxis: {
          type: 'category',
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: [120, 200, 150, 80, 70, 110, 130],
            type: 'bar'
          }
        ]
      },
      props: {
        color: '1231',
        showGrid: false,
        chartTitle: '123131',
        data: [],
        ...defaultFilterProps,
      }
    };
    this.state.addElement(newElement);
  }


  getWidgetComponent(type: string) {
    const component = WIDGET_REGISTRY[type];
    if (!component) {
      console.warn(`未找到类型为 ${type} 的组件映射`);
    }
    return component;
  }

  startResize(event: MouseEvent, el: CanvasElement, direction: string) {
    event.stopPropagation();
    event.preventDefault();

    const startX = event.clientX;
    const startY = event.clientY;
    const startW = el.width;
    const startH = el.height;
    const startPosX = el.x;
    const startPosY = el.y;
    const scale = this.state.scale();

    const onMouseMove = (moveEvent: MouseEvent) => {
      // 1. 计算鼠标位移并除以缩放比例，转换回逻辑位移
      const deltaX = (moveEvent.clientX - startX) / scale;
      const deltaY = (moveEvent.clientY - startY) / scale;

      let newW = startW, newH = startH, newX = startPosX, newY = startPosY;

      // 2. 根据方向计算新的几何属性
      if (direction.includes('e')) newW = startW + deltaX;
      if (direction.includes('s')) newH = startH + deltaY;

      if (direction.includes('w')) {
        newW = startW - deltaX;
        newX = startPosX + deltaX;
      }
      if (direction.includes('n')) {
        newH = startH - deltaY;
        newY = startPosY + deltaY;
      }

      // 3. 限制最小尺寸，防止倒置
      if (newW < 20) { newW = 20; newX = el.x; }
      if (newH < 20) { newH = 20; newY = el.y; }

      
      this.state.updateElement(el.id, { width: newW, height: newH, x: newX, y: newY });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }


  getElementFilterStyle(el: CanvasElement) {
    const p = el.props;
    
    // 1. 拼接 Filter 字符串
    // 注意：滤镜可以叠加，中间用空格分隔
    const filters = [
      `hue-rotate(${p.hue || 0}deg)`,
      `saturate(${p.saturation ?? 100}%)`,
      `contrast(${p.contrast ?? 100}%)`,
      `brightness(${p.brightness ?? 100}%)`
    ].join(' ');

    return p.filterOn ? filters : 'none';
  }


  onMouseDown(e: MouseEvent, el: any) {
    this.state.selectedId.set(el.id)
    // 1. 阻止冒泡和默认行为（防止触发浏览器的图片拖拽或文字选中）
    e.preventDefault();
    e.stopPropagation();

    // 2. 锁定初始状态
    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startElX = el.x;
    const startElY = el.y;
    const scale = this.state.scale();

    // 设置全局拖拽状态
    this.state.setDragging(true);
    this.state.selectedId.set(el.id);

    // 3. 定义移动处理函数
    const onMouseMove = (moveEv: MouseEvent) => {
      // 计算纯粹的逻辑位移（需除以缩放比例）
      const deltaX = (moveEv.clientX - startMouseX) / scale;
      const deltaY = (moveEv.clientY - startMouseY) / scale;

      // 计算新坐标并取整（防止次像素抖动）
      const newX = Math.round(startElX + deltaX);
      const newY = Math.round(startElY + deltaY);

      // 实时更新状态（如果是性能瓶颈，可以考虑直接操作 DOM style，见下文优化）
      this.state.updateElement(el.id, { x: newX, y: newY });
    };

    // 4. 定义结束处理函数
    const onMouseUp = () => {
      this.state.setDragging(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    // 5. 挂载到 document 确保鼠标滑出组件也能继续拖拽
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

}