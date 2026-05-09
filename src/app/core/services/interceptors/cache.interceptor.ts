import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, tap } from 'rxjs';
import { SKIP_RETRY } from '../api/api-options.interface';

// 简单的内存存储，生产环境建议封装成独立的 CacheService
const cacheStack = new Map<string, { expiry: number; response: HttpResponse<any> }>();

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. 仅缓存 GET 请求
  if (req.method !== 'GET') {
    return next(req);
  }

  if (req.context.get(SKIP_RETRY)) {
    return next(req); // 跳过缓存逻辑
  }

  // 2. 检查是否有有效缓存
  const cachedData = cacheStack.get(req.urlWithParams);
  if (cachedData) {
    if (Date.now() < cachedData.expiry) {
      console.log(`%c[Cache] 复用缓存: ${req.url}`, 'color: #9C27B0');
      return of(cachedData.response); // 返回缓存的 Observable
    } else {
      cacheStack.delete(req.urlWithParams); // 过期删除
    }
  }

  // 3. 发送请求并存入缓存
  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse && event.status === 200) {
        const ttl = 1000 * 60 * 5; // 缓存有效期（例如 5 分钟）
        cacheStack.set(req.urlWithParams, {
          expiry: Date.now() + ttl,
          response: event
        });
      }
    })
  );
};