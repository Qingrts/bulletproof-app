import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-datasource-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './datasource-config.component.html',
  styleUrls: ['./datasource-config.component.scss']
})
export class DataSourceConfigComponent {
  // 配置数据状态
  config = {
    baseUrl: '',
    refreshInterval: 30,
    method: 'get',
    type: 'http'
  };

  headers = signal([{ key: '', value: '' }]);

  addHeader() {
    this.headers.update(h => [...h, { key: '', value: '' }]);
  }

  removeHeader(index: number) {
    if (this.headers().length === 1) return;
    this.headers.update(h => h.filter((_, i) => i !== index));
  }

  save() {
    console.log('Saving config:', this.config, this.headers());
    // 这里可以调用 Service 发送 API
  }

  close() {
    // 关闭弹窗逻辑
  }
}