import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase } from 'idb';
import { StorageService } from '../storage.service';

@Injectable({ providedIn: 'root' })
export class IndexedDBStorageService extends StorageService {
  private readonly DB_NAME = 'MallAdminDB';
  private readonly STORE_NAME = 'ProductCache';
  private dbPromise: Promise<IDBPDatabase>;

  constructor() {
    super();
    this.dbPromise = openDB(this.DB_NAME, 1, {
      upgrade(db: IDBPDatabase) {
        // 如果表不存在则创建
        if (!db.objectStoreNames.contains('ProductCache')) {
          db.createObjectStore('ProductCache');
        }
      },
    });
  }

  /** 获取数据 */
  async get<T>(key: string): Promise<T | undefined> {
    const db = await this.dbPromise;
    return db.get(this.STORE_NAME, key);
  }

  /** 存储数据 */
  async set<T>(key: string, value: T): Promise<void> {
    const db = await this.dbPromise;
    await db.put(this.STORE_NAME, value, key);
  }

  /** 删除单条 */
  async delete(key: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete(this.STORE_NAME, key);
  }

  /** 清空所有缓存 */
  async clear(): Promise<void> {
    const db = await this.dbPromise;
    await db.clear(this.STORE_NAME);
  }
}