import { HttpInterceptorFn, HttpEventType } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap, finalize } from 'rxjs';
import { LoadingService } from '../loading.service';
import { SKIP_LOADING } from '../api/api-options.interface';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_LOADING)) {
    return next(req);
  }

  const loadingService = inject(LoadingService);
  loadingService.show();

  return next(req).pipe(
    tap(event => {
      switch (event.type) {
        case HttpEventType.UploadProgress:
          if (event.total) {
            const progress = Math.round((100 * event.loaded) / event.total);
            loadingService.update(progress);
          }
          break;
        case HttpEventType.DownloadProgress:
          if (event.total) {
            const progress = Math.round((100 * event.loaded) / event.total);
            loadingService.update(progress);
          }
          break;
        case HttpEventType.Response:
          loadingService.update(100);
          break;
      }
    }),
    finalize(() => {
      loadingService.hide();
    })
  );
};