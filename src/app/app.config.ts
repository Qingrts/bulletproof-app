import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { isDevMode } from '@angular/core';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';

import { profilingInterceptor } from './core/services/interceptors/profiling.interceptor';
import { offlineInterceptor } from './core/services/interceptors/offline.interceptor';
import { idempotencyInterceptor } from './core/services/interceptors/idempotency.interceptor';
import { cacheInterceptor } from './core/services/interceptors/cache.interceptor';
import { authInterceptor } from './core/services/interceptors/auth.interceptor';
import { loadingInterceptor } from './core/services/interceptors/loading.interceptor';
import { retryInterceptor } from './core/services/interceptors/retry.interceptor';
import { errorInterceptor } from './core/services/interceptors/error.interceptor';
import { API_CONFIG } from './core/services/api/api-config.interface';

import { routes } from './app.routes';
import { LocalStorageService } from './core/storage/implementations/local-storage.service';
import { IndexedDBStorageService } from './core/storage/implementations/indexeddb-storage.service';
import { StorageService } from './core/storage/storage.service';
import { zh_CN, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';
import { NotificationAdapter } from './core/services/ui/notification.adapter';
import { NzNotificationAdapter } from './core/services/ui/implementations/nz-notification.adapter';

registerLocaleData(zh);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // 注入全局 API 配置
    {
      provide: API_CONFIG,
      useValue: { baseUrl: '', timeout: 10000 },
    },
    // 注册 HttpClient 和 函数式拦截器 (注意顺序：从外到内执行)
    provideHttpClient(
      withFetch(), // Angular 推荐启用 Fetch API 作为后端以获得更好性能
      withInterceptors([
        ...(isDevMode() ? [profilingInterceptor] : []),
        offlineInterceptor,
        idempotencyInterceptor,
        cacheInterceptor, // 缓存
        authInterceptor, // 认证
        retryInterceptor, // 失败重试
        loadingInterceptor, // 加载状态
        errorInterceptor, // 错误处理
      ]),
      /*
        Profiling：最外层，记录所有请求（包括缓存命中的）。
        Offline：断网直接掐断，最省资源。
        Idempotency：防抖，防止重复。
        Cache：关键点！如果缓存命中，直接返回，后面的 Loading/Auth/Retry 都不需要执行了。这样可以避免命中了缓存还要闪一下 Loading 的尴尬。
        Auth：添加 Token。
        Retry：重试逻辑。
        Loading：建议放在最后几层。因为它只应该针对那些真正发出了网络请求的任务开启。
        Error：最底层，处理最终结果。
      */
    ),
    // { provide: StorageService, useClass: LocalStorageService },
    { provide: StorageService, useClass: IndexedDBStorageService },
    { provide: NotificationAdapter, useClass: NzNotificationAdapter },
    provideNzI18n(zh_CN),
  ],
};
