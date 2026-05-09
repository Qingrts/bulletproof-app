import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { finalize, tap } from 'rxjs';

export const profilingInterceptor: HttpInterceptorFn = (req, next) => {
  const started = Date.now();
  let status: 'success' | 'error' | 'pending' = 'pending';

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) status = 'success';
      },
      error: () => (status = 'error'),
    }),
    finalize(() => {
      const elapsed = Date.now() - started;
      const color = status === 'success' ? '#4CAF50' : '#F44336';
      
      // 使用控制台分组，使日志更整洁
      console.groupCollapsed(
        `%c[API] %c${req.method} %c${req.url.split('/').pop()} %c${elapsed}ms`,
        'color: #9e9e9e; font-weight: normal',
        'color: #2196F3; font-weight: bold',
        'color: #333; font-weight: bold',
        `color: ${elapsed > 1000 ? '#FF9800' : color}; font-weight: bold`
      );
      
      console.log('Full URL:', req.urlWithParams);
      console.log('Payload:', req.body);
      console.log('Status:', status);
      console.log('Duration:', `${elapsed}ms`);
      
      console.groupEnd();
    })
  );
};