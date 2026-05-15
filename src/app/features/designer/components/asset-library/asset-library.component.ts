import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface AssetSubItem {
  name: string;
  type: string;
  defaultWidth?: number;
  defaultHeight?: number;
}

interface AssetGroup {
  name: string;
  expanded: boolean;
  items?: AssetSubItem[];
}

interface AssetCategory {
  name: string;
  groups: AssetGroup[];
}

@Component({
  selector: 'app-asset-library',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './asset-library.component.html',
  styleUrl: './asset-library.component.scss'
})
export class AssetLibraryComponent implements OnInit {

  // 当前选中状态
  selectedCategory = signal<number>(0); // 默认选中第一个一级分类
  selectedGroup = signal<number | null>(null); // 默认不选中二级分组

  // 定义分类数据
  categories = signal<AssetCategory[]>([
    {
      name: '图表',
      groups: [
        {
          name: '柱状图',
          expanded: true, // 默认展开
          items: [
            { name: '柱状图', type: 'bar', defaultWidth: 400, defaultHeight: 300, }, 
            { name: '横向柱状图', type: 'bar-h', },
          ]
        },
        { name: '折线图', expanded: false, items: [{ name: '基础折线图', type: 'line' }] },
        { name: '饼图', expanded: false, items: [{ name: '基础饼图', type: 'pie' }] },
        { name: '散点图', expanded: false, items: [{ name: '基础散点图', type: 'scatter' }] }
      ]
    },
    {
      name: '信息',
      groups: [
        { name: '所有', expanded: false },
        {
          name: '文本',
          expanded: false,
          items: [
            { name: '文字', type: 'text' },
            { name: '渐变文字', type: 'text-gradient' },
            { name: '弹幕文字', type: 'text-scroll' }
          ]
        },
        {
          name: '控件',
          expanded: false,
          items: [
            { name: '时间选择器', type: 'date-picker' },
            { name: '下拉选择器', type: 'select' }
          ]
        },
        { name: '更多', expanded: false }
      ]
    }
  ]);

  onDragStart(event: DragEvent, item: AssetSubItem) {
    // 传递组件类型给画布
    const data = { 
      type: item.type, 
      name: item.name,
      // 新增：预设尺寸
      defaultWidth: item.defaultWidth || 300, 
      defaultHeight: item.defaultHeight || 200
    };
    event.dataTransfer?.setData('application/json', JSON.stringify(data));
    event.dataTransfer!.effectAllowed = 'copy';
  }

  // 选择一级分类
  selectCategory(index: number) {
    this.selectedCategory.set(index);
    this.selectedGroup.set(null); // 切换一级时清空二级选中
  }

  // 选择二级分组
  selectGroup(index: number) {
    this.selectedGroup.set(index);
  }

  ngOnInit(): void {
    this.selectCategory(0);
    this.selectGroup(0);
  }
}