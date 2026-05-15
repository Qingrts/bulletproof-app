// assets-config.ts
export interface AssetSubItem {
  name: string;
  type: string; // 用于拖拽或点击时识别组件类型
}

export interface AssetCategory {
  name: string;
  children: (AssetSubItem | { name: string; items: AssetSubItem[] })[];
}

export const ASSET_CATEGORIES = [
  {
    name: '图表',
    groups: [
      { name: '所有' },
      {
        name: '柱状图',
        items: [{ name: '柱状图', type: 'bar' }, { name: '横向柱状图', type: 'bar-h' }]
      },
      { name: '折线图', items: [{ name: '基础折线图', type: 'line' }] },
      { name: '饼图', items: [{ name: '基础饼图', type: 'pie' }] },
      { name: '散点图', items: [{ name: '基础散点图', type: 'scatter' }] }
    ]
  },
  {
    name: '信息',
    groups: [
      { name: '所有' },
      {
        name: '文本',
        items: [
          { name: '文字', type: 'text' },
          { name: '渐变文字', type: 'text-gradient' },
          { name: '弹幕文字', type: 'text-scroll' }
        ]
      },
      {
        name: '控件',
        items: [
          { name: '时间选择器', type: 'date-picker' },
          { name: '下拉选择器', type: 'select' }
        ]
      },
      { name: '更多' }
    ]
  }
];