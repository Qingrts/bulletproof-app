import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from './api-config.interface';
import { ApiResponse } from './api-response.interface';
import { ApiOptions } from './api-options.interface';

@Injectable({
  providedIn: 'root'
})
export class ApiBaseService {
  protected readonly http = inject(HttpClient);
  protected readonly config = inject(API_CONFIG, { optional: true }); 

  protected get baseUrl(): string {
    return this.config?.baseUrl ?? '';
  }

  protected resolveUrl(endpoint: string): string {
    return endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
  }

  public get<T>(endpoint: string, options?: ApiOptions): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(this.resolveUrl(endpoint), {
      ...options,
      observe: 'body'
    });
  }

  public post<T>(endpoint: string, body: unknown, options?: ApiOptions): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(this.resolveUrl(endpoint), body, {
      ...options,
      observe: 'body'
    });
  }

  public put<T>(endpoint: string, body: unknown, options?: ApiOptions): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(this.resolveUrl(endpoint), body, {
      ...options,
      observe: 'body'
    });
  }

  public delete<T>(endpoint: string, options?: ApiOptions): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(this.resolveUrl(endpoint), {
      ...options,
      observe: 'body'
    });
  }
}