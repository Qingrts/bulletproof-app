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
  async set<T>(key: string, value: T, ttlMillis: number | null = null): Promise<void> {
    const expiry = ttlMillis ? Date.now() + ttlMillis : null;
    const item: StorageItem<T> = { value, expiry };
    
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
      return Promise.resolve();
    } catch (e) {
      console.error('LocalStorage setItem error:', e);
      // 如果空间满了，可以根据需要执行清除策略
      return Promise.resolve();
    }
    
  }

  /**
   * 读取数据
   */
  async get<T>(key: string): Promise<T | null> {
    const raw = localStorage.getItem(this.prefix + key);
    if (!raw) return null;

    try {
      const item: StorageItem<T> = JSON.parse(raw);

      // 检查是否过期
      if (item.expiry && Date.now() > item.expiry) {
        this.delete(key);
        return null;
      }

      return item.value;
    } catch (e) {
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    localStorage.removeItem(this.prefix + key);
    return Promise.resolve();
  }

  /**
   * 清除所有本应用的数据，但不触碰其他应用的数据
   */
  async clear(): Promise<void> {
    Object.keys(localStorage)
      .filter(k => k.startsWith(this.prefix))
      .forEach(k => localStorage.removeItem(k));
    return Promise.resolve();
  }
}