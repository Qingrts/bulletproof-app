import { Component, ElementRef, inject, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as echarts from 'echarts';
import { DesignerStateService } from '../../services/editor-state.service';

@Component({
  selector: 'app-echarts-chart',
  standalone: true,
  template: `<div #chartContainer [style.width]="'100%'" [style.height]="'100%'" [style.pointer-events]="state.isDragging() ? 'none' : 'auto'"></div>`,
  styles: [`:host { display: block; width: 100%; height: 100%;  }`]
})
export class BarChartComponent implements OnInit, OnChanges, OnDestroy {
  state = inject(DesignerStateService)

  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  @Input() options: echarts.EChartsOption = {};
  
  private chartInstance: echarts.ECharts | null = null;
  private resizeObserver: ResizeObserver | null = null;

  ngOnInit() {
    setTimeout(() => {
      this.initChart();
      this.setupResizeObserver();
    }, 0);
  }

  // 当画布上的元素大小改变（拖拽缩放）或配置改变时触发
  ngOnChanges() {
    if (this.chartInstance) {
      this.chartInstance.setOption(this.options);
      this.chartInstance.resize(); // 确保图表填充新尺寸
    }
  }

  private initChart() {
    this.chartInstance = echarts.init(this.chartContainer.nativeElement, 'dark'); // 使用内置深色主题
    this.chartInstance.setOption(this.options);
  }

  ngOnDestroy() {
    if (this.chartInstance) {
      this.chartInstance.dispose();
    }
  }

  private setupResizeObserver() {
    // 监听容器大小变化，这不依赖 Zone.js，也不会触发 Angular 的整体检测
    this.resizeObserver = new ResizeObserver(() => {
      if (this.chartInstance) {
        // ECharts 内部会处理防抖，非常高效
        this.chartInstance.resize();
      }
    });
    this.resizeObserver.observe(this.chartContainer.nativeElement);
  }
}