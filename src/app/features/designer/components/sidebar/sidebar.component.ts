// pages/designer/components/sidebar/sidebar.component.ts
import { Component, signal, computed } from '@angular/core';
import { ASSET_LIST, WidgetTemplate } from '../../configs/asset-manifest';
import { CdkDrag, DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-designer-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  standalone: true,
  imports: [CdkDrag, DragDropModule],
})
export class SidebarComponent {
  // 当前选中的一级分类
  activeCategory = signal('chart');

  // 一级分类定义 (对应图片最左侧一栏)
  categories = [
    { id: 'chart', label: '图表', icon: 'icon-chart' },
    { id: 'map', label: 'VChart', icon: 'icon-map' },
    { id: 'info', label: '信息', icon: 'icon-info' },
    { id: 'list', label: '列表', icon: 'icon-info' },
    { id: 'widget', label: '小组件', icon: 'icon-info' },
    { id: 'image', label: '图片', icon: 'icon-info' },
    { id: 'icon', label: '图标', icon: 'icon-info' },
  ];

  // 根据选中的一级分类，计算要显示的二级组件列表
  filteredAssets = computed(() => 
    ASSET_LIST.filter(item => item.category === this.activeCategory())
  );

  setCategory(id: string) {
    this.activeCategory.set(id);
  }
}