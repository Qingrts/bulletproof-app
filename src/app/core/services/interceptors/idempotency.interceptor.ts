import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { finalize } from 'rxjs';

import { ALLOW_CONCURRENT } from '../api/api-options.interface';

// 存储当前正在进行的请求指纹
const activeRequests = new Set<string>();

/**
 * 生成请求指纹：结合方法、URL 和请求体
 */
function createFingerprint(req: HttpRequest<any>): string {
  const body = req.body ? JSON.stringify(req.body) : '';
  return `${req.method}:${req.urlWithParams}:${body}`;
}

export const idempotencyInterceptor: HttpInterceptorFn = (req, next: HttpHandlerFn) => {
  if (req.context.get(ALLOW_CONCURRENT)) {
    return next(req);
  }

  // 1. 幂等方法（GET/HEAD/OPTIONS）通常不需要防抖
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next(req);
  }

  const fingerprint = createFingerprint(req);

  // 2. 如果请求池中已存在相同指纹，说明是重复提交
  if (activeRequests.has(fingerprint)) {
    console.warn(`%c[Idempotency] 拦截到重复提交: ${req.url}`, 'color: #FF9800');
    // 返回一个“永远不结束”或直接报错的 Observable，防止进入业务逻辑
    // 也可以抛出特定错误让 UI 层捕获
    throw new Error('DUPLICATE_REQUEST');
  }

  // 3. 记录请求并继续执行
  activeRequests.add(fingerprint);

  // 4. 通过拦截器自动为每个非 GET 请求生成一个 X-Idempotency-Key（UUID），并存入 Header。
  const idempotencyKey = crypto.randomUUID();
  const clonedReq = req.clone({ setHeaders: { 'X-Idempotency-Key': idempotencyKey } });

  return next(clonedReq).pipe(
    finalize(() => {
      // 4. 无论成功还是失败，请求结束后从池中移除
      activeRequests.delete(fingerprint);
    })
  );
};