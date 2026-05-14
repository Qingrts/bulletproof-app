// core/configs/asset-manifest.ts
export interface WidgetTemplate {
  type: string;
  name: string;
  icon: string;      // 缩略图路径
  category: string;  // 所属一级分类
  defaultConfig: any;
}

export const ASSET_LIST: WidgetTemplate[] = [
  {
    type: 'map',
    name: '高德地图',
    category: 'map',
    icon: 'assets/images/map-thumb.png',
    defaultConfig: { apiKey: '', theme: 'dark' }
  },
  {
    type: 'bar-chart',
    name: '柱状图',
    category: 'chart',
    icon: 'assets/images/bar-thumb.png',
    defaultConfig: { title: '销售统计' }
  }
  // ... 更多组件
];