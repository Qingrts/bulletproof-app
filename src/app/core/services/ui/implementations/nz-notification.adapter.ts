import { Injectable, inject } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message'; // 假设用 Ng-Zorro
import { NotificationAdapter } from '../notification.adapter';

@Injectable()
export class NzNotificationAdapter extends NotificationAdapter {
  private nzMessage = inject(NzMessageService);

  success(message: string): void {
    this.nzMessage.success(message);
  }

  error(message: string): void {
    this.nzMessage.error(message);
  }

  warn(message: string): void {
    this.nzMessage.warning(message);
  }
}