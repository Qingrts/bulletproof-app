import { Injectable } from '@angular/core';

@Injectable()
export abstract class StorageService {
  abstract get<T>(key: string): Promise<T | null | undefined>;
  abstract set<T>(key: string, value: T): Promise<void>;
  abstract delete(key: string): Promise<void>;
  abstract clear(): Promise<void>;
}