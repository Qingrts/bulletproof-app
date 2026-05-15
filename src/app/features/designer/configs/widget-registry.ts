// core/configs/widget-registry.ts
import { Type } from '@angular/core';
import { BarChartComponent } from '../widgets/charts/bar-chart.component';
// 导入你实际的业务组件
// import { MapWidgetComponent } from '../widgets/map/map.component';
// import { BarChartComponent } from '../widgets/charts/bar.component';

export const WIDGET_REGISTRY: Record<string, Type<any>> = {
  // 'map': MapWidgetComponent,
  // 'bar-chart': BarChartComponent,
  // 'text': TextWidgetComponent,
  'bar': BarChartComponent,
};