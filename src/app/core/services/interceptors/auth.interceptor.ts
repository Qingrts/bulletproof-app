import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AppStateService } from '../app-state.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 现代 Angular 推荐使用 inject() 获取服务状态

  const appState = inject(AppStateService);
  
  const token = localStorage.getItem('access_token'); // 示例

  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedReq);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        appState.notifyUnauthorized();
      }
      return throwError(() => error);
    })
  );
};