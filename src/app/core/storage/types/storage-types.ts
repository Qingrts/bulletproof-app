export interface StorageItem<T> {
  value: T;
  expiry: number | null; // 时间戳，null 表示永不过期
}