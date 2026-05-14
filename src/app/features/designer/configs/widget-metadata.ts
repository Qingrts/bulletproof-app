// core/configs/widget-metadata.ts
export const WIDGET_METADATA: any = {
  'map': {
    groups: [
      { name: '基础', fields: ['name', 'x', 'y', 'w', 'h'] },
      { name: '地图', fields: ['apiKey', 'theme', 'zoom'] }
    ]
  },
  'bar-chart': {
    groups: [
      { name: '基础', fields: ['name', 'x', 'y'] },
      { name: '数据', fields: ['dataSource', 'refreshInterval'] }
    ]
  }
};