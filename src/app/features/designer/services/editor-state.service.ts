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

export interface CanvasElement {
  id: string;
  type: string;
  name: string;
  x: number;      // 逻辑坐标
  y: number;      // 逻辑坐标
  width: number;
  height: number;
  zIndex?: number;
  config: any; // 存储地图 Key、主题、数据源等
  props: {
    hue: number;
    saturation: number;
    contrast: number;
    brightness: number;
    filterOn: any;
    opacity: number;
    color: string;
    showGrid: boolean;
    chartTitle: string;
    data: number[];
  };
}

@Injectable({ providedIn: 'root' })
export class DesignerStateService {
  // 核心状态：组件列表
  widgets = signal<Widget[]>([]);
  
  // 当前选中的组件 ID
  selectedId = signal<string | null>(null);

  hoverPosition = signal<{ x: number | null, y: number | null }>({ x: null, y: null });

  // 计算属性：当前激活的组件对象 (用于右侧属性面板)
  activeWidget = computed(() => 
    this.widgets().find(w => w.id === this.selectedId())
  );

  // 画布缩放比例 (对应图片底部的 50% 缩放)
  scale = signal(0.5);

  scrollX = signal(0);
  scrollY = signal(0);

  updateWidget(id: string, patch: Partial<Widget>) {
    this.widgets.update(list => list.map(w => 
      w.id === id ? { ...w, ...patch } : w
    ));
  }

  deleteWidget(d: any) {}
  copyWidget(d: any) {}


  // 画布上的元素列表
  elements = signal<CanvasElement[]>([]);

  // 添加元素的方法
  addElement(element: CanvasElement) {
    this.elements.update(prev => [...prev, element]);
    console.log('this.elements', this.elements())
  }

  // 更新指定元素的尺寸和位置
  updateElement(id: string, patch: Partial<CanvasElement>) {
    this.elements.update(els => els.map(el => 
      el.id === id ? { ...el, ...patch } : el
    ));
  }

  selectedElement = computed(() => {
    const id = this.selectedId();
    return this.elements().find(el => el.id === id) || null;
  });

  // 画布全局配置
  canvasConfig = signal({
    width: 1920,
    height: 1080,
    background: '#0f0f0f',
    backgroundImage: '',
    showGrid: true,
    gridSize: 10,
    gridColor: 'rgba(255, 255, 255, 0.05)' // 网格线条颜色
  });

  // 更新画布配置的方法
  updateCanvas(patch: Partial<any>) {
    this.canvasConfig.update(prev => ({ ...prev, ...patch }));
  }
}