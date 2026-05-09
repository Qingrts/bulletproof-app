import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { SKIP_ERROR_HANDLING } from '../api/api-options.interface';
import { ApiError } from '../models/api-error.model';
import { NotificationAdapter } from '../ui/notification.adapter';
import { inject } from '@angular/core';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notify = inject(NotificationAdapter); // 👈 注入的是抽象类

  // 如果请求配置了跳过全局错误处理，则直接放行
  if (req.context.get(SKIP_ERROR_HANDLING)) {
    return next(req);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const apiError: ApiError = {
        code: error.status,
        message: '发生了未知错误',
        timestamp: new Date().toISOString()
      };

      if (error.error instanceof ErrorEvent) {
        // 客户端或网络错误
        apiError.message = `网络错误: ${error.error.message}`;
      } else {
        // 后端返回的错误
        apiError.message = error.error?.message || error.message;
        apiError.details = error.error;
      }

      // TODO: 使用你的 MessageService 或 ToastService 弹出错误提示
      console.error(`[API 错误 ${apiError.code}]:`, apiError.message);
      notify.error(apiError.message);

      return throwError(() => apiError);
    })
  );
};