import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  // 当前进度百分比 (0-100)
  readonly progress = signal<number>(0);
  // 是否正在加载
  readonly isLoading = signal<boolean>(false);

  show() {
    this.isLoading.set(true);
    this.progress.set(10); // 初始点亮
  }

  update(value: number) {
    this.progress.set(value);
  }

  hide() {
    this.progress.set(100);
    setTimeout(() => {
      this.isLoading.set(false);
      this.progress.set(0);
    }, 200); // 留出一点时间让用户看到 100% 状态
  }
}