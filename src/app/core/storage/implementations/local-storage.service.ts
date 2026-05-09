import { Injectable } from "@angular/core";
import { StorageService } from "../storage.service";
import { StorageItem } from "../types/storage-types";

@Injectable()
export class LocalStorageService extends StorageService {
  private readonly prefix = 'APP_V1_';

  /**
   * 存储数据
   * @param key 键名
   * @param value 数据
   * @param ttlMillis 可选过期时间（毫秒），例如 3600000 为 1 小时
   */
  setItem<T>(key: string, value: T, ttlMillis: number | null = null): void {
    const expiry = ttlMillis ? Date.now() + ttlMillis : null;
    const item: StorageItem<T> = { value, expiry };
    
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (e) {
      console.error('LocalStorage setItem error:', e);
      // 如果空间满了，可以根据需要执行清除策略
    }
  }

  /**
   * 读取数据
   */
  getItem<T>(key: string): T | null {
    const raw = localStorage.getItem(this.prefix + key);
    if (!raw) return null;

    try {
      const item: StorageItem<T> = JSON.parse(raw);

      // 检查是否过期
      if (item.expiry && Date.now() > item.expiry) {
        this.removeItem(key);
        return null;
      }

      return item.value;
    } catch (e) {
      return null;
    }
  }

  removeItem(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }

  /**
   * 清除所有本应用的数据，但不触碰其他应用的数据
   */
  clear(): void {
    Object.keys(localStorage)
      .filter(k => k.startsWith(this.prefix))
      .forEach(k => localStorage.removeItem(k));
  }
}