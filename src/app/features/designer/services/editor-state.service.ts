import { Injectable, signal, computed } from '@angular/core';

export interface Widget {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  config: any; // 存储地图 Key、主题、数据源等
  zIndex?: number;
}

@Injectable({ providedIn: 'root' })
export class DesignerStateService {
  // 核心状态：组件列表
  widgets = signal<Widget[]>([]);
  
  // 当前选中的组件 ID
  selectedId = signal<string | null>(null);

  // 计算属性：当前激活的组件对象 (用于右侧属性面板)
  activeWidget = computed(() => 
    this.widgets().find(w => w.id === this.selectedId())
  );

  // 画布缩放比例 (对应图片底部的 50% 缩放)
  scale = signal(1.5);

  scrollX = signal(0);
  scrollY = signal(0);

  updateWidget(id: string, patch: Partial<Widget>) {
    this.widgets.update(list => list.map(w => 
      w.id === id ? { ...w, ...patch } : w
    ));
  }

  deleteWidget(d: any) {}
  copyWidget(d: any) {}
}