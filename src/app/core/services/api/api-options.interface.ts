import { HttpContext, HttpContextToken, HttpHeaders, HttpParams } from '@angular/common/http';

// 定义上下文令牌，用于在拦截器中跳过某些全局行为
export const SKIP_LOADING = new HttpContextToken<boolean>(() => false);
export const SKIP_ERROR_HANDLING = new HttpContextToken<boolean>(() => false);
export const SKIP_RETRY = new HttpContextToken<boolean>(() => false);
export const REFRESH_CHECK = new HttpContextToken<boolean>(() => false);


/**
 * 1. 防止数据冗余：如果不加限制，用户双击“创建订单”可能会在数据库生成两条记录。
 * 2. 节省后端资源：在请求到达服务器前就将其拦截，避免了后端昂贵的计算或数据库写入操作。
 * 3. 弱网环境保护：在 3G/4G 环境下，用户由于看不到反馈往往会反复点击，该拦截器能确保只有第一个请求有效。
 */
export const ALLOW_CONCURRENT = new HttpContextToken<boolean>(() => false);

export interface ApiOptions {
  headers?: HttpHeaders | Record<string, string | string[]>;
  params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
  context?: HttpContext;
  reportProgress?: boolean;
  withCredentials?: boolean;
}
