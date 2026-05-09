import { Injectable } from '@angular/core';

@Injectable()
export abstract class NotificationAdapter {
  abstract success(message: string, title?: string): void;
  abstract error(message: string, title?: string): void;
  abstract warn(message: string, title?: string): void;
}