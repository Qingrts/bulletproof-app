import { Component, input, model, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-collapsible-group',
  standalone: true,
  imports: [CommonModule, FormsModule, NzIconModule],
  templateUrl: './collapsible-group.component.html',
  styleUrls: ['./collapsible-group.component.scss']
})
export class CollapsibleGroupComponent {
  title = input.required<string>();
  showSwitch = input<boolean>(false);
  // 使用 model 信号实现双向绑定，方便外部控制开关状态
  enabled = model<boolean>(true);
  
  expanded = signal(false);

  toggle() {
    this.expanded.update(v => !v);
  }
}