import { Injectable, inject, signal, computed } from '@angular/core';
import { GolfStrategy } from '../strategies/golf.strategy';
import { BaseProduct, GolfProduct, TTimeSlot } from '../models/index';
import { finalize } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GolfFacade {
  private strategy = inject(GolfStrategy);

  // --- 1. 状态管理 (Signals) ---
  items = signal<BaseProduct[]>([]);
  loading = signal(false);
  
  // 当前正在编辑的商品
  currentProduct = signal<GolfProduct | null>(null);
  
  // 当前编辑器选中的日期
  selectedDate = signal<string>(new Date().toISOString().split('T')[0]);

  // --- 2. 派生状态 (Computed) ---
  // 自动根据选中的日期，从当前商品数据中提取时段列表
  currentDaySlots = computed(() => {
    const product = this.currentProduct();
    const date = this.selectedDate();
    return product?.tTimeSlots?.[date] || [];
  });

  // --- 3. 业务动作 (Actions) ---

  /** 加载列表 */
  loadList(page: number, query: string = '') {
    this.loading.set(true);
    this.strategy.fetchList(page, query)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(res => this.items.set(res.data));
  }

  /** 加载单个球场详情 */
  loadDetail(id: string) {
    this.loading.set(true);
    // this.strategy.getDetail(id)
    //   .pipe(finalize(() => this.loading.set(false)))
    //   .subscribe(data => this.currentProduct.set(data));
  }

  /** 
   * 切换某个时段的状态 (例如：手动封场)
   */
  toggleSlotStatus(slotTime: string) {
    const product = this.currentProduct();
    if (!product) return;

    const date = this.selectedDate();
    const slots = [...(product.tTimeSlots[date] || [])];
    const index = slots.findIndex(s => s.time === slotTime);

    if (index > -1) {
      const currentStatus = slots[index].status;
      slots[index] = { 
        ...slots[index], 
        status: currentStatus === 'available' ? 'maintenance' : 'available' 
      };

      // 更新 Signal 触发 UI 重绘
      this.currentProduct.set({
        ...product,
        tTimeSlots: { ...product.tTimeSlots, [date]: slots }
      });
    }
  }

  /**
   * 批量更新当前日期的价格
   */
  updateDayPrice(price: number) {
    const product = this.currentProduct();
    if (!product) return;

    const date = this.selectedDate();
    const updatedSlots = (product.tTimeSlots[date] || []).map(slot => ({
      ...slot,
      price: price
    }));

    this.currentProduct.set({
      ...product,
      tTimeSlots: { ...product.tTimeSlots, [date]: updatedSlots }
    });
  }

  /** 保存到后端 */
  save() {
    const data = this.currentProduct();
    if (!data) return;

    this.loading.set(true);
    // this.strategy.save(data)
    //   .pipe(finalize(() => this.loading.set(false)))
    //   .subscribe(() => {
    //     // 处理成功通知
    //   });
  }
}