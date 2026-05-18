import { Component, input, output, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppInputComponent } from "@shared/components";
import { AppInputNumberComponent } from '@shared/components/input-number/input-number.component';

export interface ControlConfig {
  key: string;      // 对应 props 中的字段名
  label: string;
  input: 'progress' | 'number' | 'switch' | 'color' | 'select' | 'string';
  min?: number;
  max?: number;
  maxLength?: number;
  unit?: string;
  options?: { label: string, value: any }[]; // 给 select 用
  width?: string;
}

@Component({
  selector: 'app-property-control',
  standalone: true,
  imports: [CommonModule, FormsModule, AppInputComponent, AppInputNumberComponent],
  templateUrl: './property-control.component.html',
  styleUrl: './property-control.component.scss'
})
export class PropertyControlComponent {
  // 配置项
  config = input.required<ControlConfig[]>();
  
  // 绑定的数据对象 (CanvasElement.props)
  values = model.required<any>();
  
  // 当数值改变时触发，用于通知 Canvas 重新渲染
  changed = output<void>();

  onValueChange() {
    this.changed.emit();
  }
}