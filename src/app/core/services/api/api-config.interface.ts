import { InjectionToken } from '@angular/core';

export interface ApiConfig {
  baseUrl: string;
  timeout?: number;
}

// 用于在全局提供 API 配置
export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG');