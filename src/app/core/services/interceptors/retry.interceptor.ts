import { HttpInterceptorFn } from '@angular/common/http';
import { retry, timer } from 'rxjs';
import { SKIP_RETRY } from '../api/api-options.interface';

export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_RETRY)) {
    return next(req);
  }

  return next(req).pipe(
    retry({
      count: 2, // 重试 2 次
      delay: (error, retryCount) => {
        // 仅对 502/503/504 等服务器网关错误进行重试
        if ([502, 503, 504].includes(error.status)) {
          return timer(retryCount * 1000); // 延迟 1s, 2s 递增
        }
        throw error;
      }
    })
  );
};