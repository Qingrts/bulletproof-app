import { HttpClient, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ProductService } from '../services/api/product.service';
import { PaginationResponse } from '@core/models';
import { ProductModel } from '../models';

/**
 * 策略接口：定义所有品类必须实现的方法
 */
export abstract class BaseProductStrategy<T = any> {
  protected http = inject(ProductService);

  /**
   * 列表请求的通用实现
   */
  fetchList(page: number, query: string): Observable<PaginationResponse<ProductModel[]>> {
    return this.http.getProductsByPost();
  }


//   /**
//    * 抽象方法：由具体子类决定如何处理保存数据
//    * 比如酒店需要处理房态 JSON，而景区只需要处理门票阶梯价
//    */
//   abstract save(data: T): Observable<void>;
  
//   /**
//    * 抽象方法：处理不同品类的删除逻辑
//    */
//   abstract delete(id: string): Observable<void>;
}