import { Injectable, inject } from '@angular/core';
import { Observable, retry, timeout } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiBaseService } from '@core/services/api/api-base.service';
import { ProductModel } from '../../models';
import { PaginationResponse } from '@core/models';

@Injectable({ providedIn: 'root' })
export class ProductService extends ApiBaseService {
  private readonly apiUrl = '/api/hotel/products';

  getProductsByPost(): Observable<PaginationResponse<ProductModel[]>> {
    return this.get<PaginationResponse<ProductModel[]>>(`${this.apiUrl}`).pipe(map(res => res.data));
  }

  createProduct(input: ProductModel): Observable<ProductModel> {
    return this.post<ProductModel>(this.apiUrl, input).pipe(map(res => res.data));
  }

  deleteProduct(commentId: string): Observable<void> {
    return this.delete<void>(`${this.apiUrl}/${commentId}`).pipe(map(res => res.data));
  }
}
