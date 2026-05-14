import { CommonModule } from "@angular/common";
import { Component, input, effect } from "@angular/core";

// pages/designer/widgets/charts/base-chart.component.ts
@Component({ 
selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule, 
  ],
  template: `12312`,
 })
export class BaseChartComponent {
  // 接收来自画布传入的 config Signal
  config = input.required<any>();
  chartInstance: any;

  constructor() {
    // Angular @21 特性：使用 effect 监听输入变化
    effect(() => {
      const currentConfig = this.config();
      this.refreshChart(currentConfig);
    });
  }

  private refreshChart(config: any) {
    if (this.chartInstance) {
      // 仅更新配置，不重新销毁实例，保证 60fps 性能
      this.chartInstance.setOption(config.option);
    }
  }
}