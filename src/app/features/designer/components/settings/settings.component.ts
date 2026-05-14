import { Component, inject } from "@angular/core";
import { DesignerStateService, Widget } from "../../services/editor-state.service";
import { WIDGET_METADATA } from "../../configs/widget-metadata";

@Component({
  standalone: true,
  selector: 'app-designer-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  imports: []
})
export class SettingsComponent {
  state = inject(DesignerStateService);

  // 使用 computed 直接获取当前激活组件，性能最优
  activeWidget = this.state.activeWidget;

  // 字段中文名称映射
  fieldLabels: Record<string, string> = {
    name: '组件名称',
    x: '横坐标 (X)',
    y: '纵坐标 (Y)',
    w: '宽度 (W)',
    h: '高度 (H)',
    apiKey: '高德地图 Key',
    theme: '地图主题',
    zoom: '默认缩放',
    dataSource: '数据源地址',
    refreshInterval: '刷新频率(ms)'
  };

  // 内部辅助方法：处理数据路径（例如 x, y 在根部，apiKey 在 config 内部）
  private processValue(field: string, val: any) {
    const rootFields = ['name', 'x', 'y', 'w', 'h'];
    return rootFields.includes(field)
      ? { [field]: Number(val) || val }
      : { config: { ...this.activeWidget()?.config, [field]: val } };
  }
  /**
 * 1. getGroups: 根据组件类型获取配置分组
 */
  getGroups(type: string) {
    return WIDGET_METADATA[type]?.groups || [];
  }

  /**
   * 2. getFieldType: 判断字段应该使用哪种输入控件
   */
  getFieldType(field: string): 'number' | 'select' | 'text' | 'color' {
    const colorFields = ['bgColor', 'textColor', 'borderColor', 'chartColor'];
    if (colorFields.includes(field)) return 'color';

    // 原有的逻辑...
    const numberFields = ['x', 'y', 'w', 'h', 'zoom'];
    if (numberFields.includes(field)) return 'number';
    return 'text';
  }

  /**
   * 3. getProperty: 安全地从 Widget 对象中读取属性值
   * 处理嵌套逻辑：基础属性在根部，业务属性在 config 内部
   */
  getProperty(widget: Widget, field: string): any {
    const rootFields = ['name', 'x', 'y', 'w', 'h'];
    if (rootFields.includes(field)) {
      return (widget as any)[field];
    }
    // 读取嵌套在 config 里的业务属性
    return widget.config ? widget.config[field] : '';
  }

  // 之前的 onPropertyChange 补充：确保更新时保持响应性
  onPropertyChange(widget: Widget, field: string, event: Event) {
    const input = event.target as HTMLInputElement;
    let val: any = input.value;

    // 类型转换处理
    if (this.getFieldType(field) === 'number') {
      val = val === '' ? 0 : Number(val);
    }

    const rootFields = ['name', 'x', 'y', 'w', 'h'];
    if (rootFields.includes(field)) {
      this.state.updateWidget(widget.id, { [field]: val });
    } else {
      // 更新嵌套的 config 属性
      const newConfig = { ...widget.config, [field]: val };
      this.state.updateWidget(widget.id, { config: newConfig });
    }
  }
}