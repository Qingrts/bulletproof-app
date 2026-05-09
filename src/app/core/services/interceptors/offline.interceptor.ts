import { HttpInterceptorFn } from "@angular/common/http";
import { throwError } from "rxjs";

// interceptors/offline.interceptor.ts
export const offlineInterceptor: HttpInterceptorFn = (req, next) => {
  if (!navigator.onLine) {
    // 也可以抛出自定义错误，由 errorInterceptor 统一处理
    return throwError(() => ({
      code: 0,
      message: '当前处于离线状态，请检查网络连接',
      timestamp: new Date().toISOString()
    }));
  }
  return next(req);
};