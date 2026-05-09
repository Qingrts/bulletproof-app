import { Injectable } from '@angular/core';

@Injectable()
export abstract class StorageService {
  abstract getItem<T>(key: string): T | null;
  abstract setItem<T>(key: string, value: T, ttl?: number): void;
  abstract removeItem(key: string): void;
  abstract clear(): void;
}