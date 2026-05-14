import { Injectable, inject, signal, computed } from "@angular/core";
import { GolfStrategy } from "../strategies/golf.strategy";
import { HotelStrategy } from "../strategies/hotel.strategy";
import { BaseProduct } from "../models";

@Injectable({ providedIn: 'root' })
export class ProductFacade {
  // 注入具体策略
  private hotel = inject(HotelStrategy);
  private golf = inject(GolfStrategy);

  // 当前品类状态
  category = signal<'HOTEL' | 'GOLF'>('HOTEL');
  
  products = signal<BaseProduct[]>([]);
  isLoading = signal(false);
  total = signal(0);
  pageIndex = signal(1);

  // 核心：动态选择当前生效的策略
  private activeStrategy = computed(() => {
    return this.category() === 'HOTEL' ? this.hotel : this.golf;
  });

  // 组件调用的方法
  loadPage(page: number) {
    this.activeStrategy().fetchList(page, '').subscribe(res => {
      console.log('resresresresres', res);
      this.products.set(res.data);
    });
  }

  saveProduct(data: any) {
    // this.activeStrategy().save(data).subscribe(/* ... */);
  }
}