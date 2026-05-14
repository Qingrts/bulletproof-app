// shared/components/resize-handlers/resize-handlers.component.ts
import { Component, input, output, inject } from '@angular/core';
import { DesignerStateService } from '../../services/editor-state.service';

type Direction = 'n' | 's' | 'w' | 'e' | 'nw' | 'ne' | 'sw' | 'se';

@Component({
  selector: 'app-resize-handlers',
  standalone: true,
  templateUrl: './resize-handlers.component.html',
  styleUrl: './resize-handlers.component.scss'
})
export class ResizeHandlerComponent {
  widget = input.required<any>();
  state = inject(DesignerStateService);

  // 定义 8 个方位的控制点
  readonly handles: Direction[] = ['n', 's', 'w', 'e', 'nw', 'ne', 'sw', 'se'];

  onResizeStart(event: MouseEvent, dir: Direction) {
    event.stopPropagation();
    event.preventDefault();

    const startX = event.clientX;
    const startY = event.clientY;
    const startRect = { ...this.widget() };
    const scale = this.state.scale();

    const onMouseMove = (e: MouseEvent) => {
      // 计算鼠标偏移量，必须除以画布当前的缩放比例 scale
      const dx = (e.clientX - startX) / scale;
      const dy = (e.clientY - startY) / scale;

      let { x, y, w, h } = startRect;

      // 核心算法：根据不同方位计算新的尺寸和位置
      if (dir.includes('e')) w += dx;
      if (dir.includes('s')) h += dy;
      if (dir.includes('w')) { x += dx; w -= dx; }
      if (dir.includes('n')) { y += dy; h -= dy; }

      // 限制最小尺寸
      w = Math.max(20, w);
      h = Math.max(20, h);

      // 实时更新全局状态 (Signal 会自动触发画布重绘)
      this.state.updateWidget(this.widget().id, { x, y, w, h });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      // 这里可以执行 MoveCommand 存入历史栈
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }
}