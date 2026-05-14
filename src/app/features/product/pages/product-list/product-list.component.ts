import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSpaceModule } from 'ng-zorro-antd/space';

import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { TableColumn } from '@shared/components/data-table/models/table.model';
import { ProductFacade } from '../../services/product.facade';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule, 
    NzButtonModule, 
    NzInputModule, 
    NzSpaceModule, 
    DataTableComponent,
    FormsModule,
  ],
  templateUrl: './product-list.component.html',
  // styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  // 1. 注入依赖
  private router = inject(Router);
  protected facade = inject(ProductFacade); // 注入具体的 Facade 实现


  // 2. 定义表格列配置
  readonly columns: TableColumn[] = [
    { key: 'mainImage', label: '商品图', type: 'image', width: '100px' },
    { key: 'name', label: '商品名称' },
    { key: 'category', label: '品类', type: 'badge', width: '120px' },
    { key: 'price', label: '起售价', type: 'template', width: '150px' },
    { key: 'statusLabel', label: '状态', type: 'badge', width: '100px' },
    { key: 'updatedAt', label: '更新时间', width: '180px' }
  ];

  // 3. 搜索条件状态 (Signal)
  searchName = signal('');

  ngOnInit() {
    // 初始化加载第一页
    this.facade.loadPage(1);
  }

  // 刷新数据
  onReload() {
    this.facade.loadPage(1);
  }

  // 分页切换
  onPageChange(index: number) {
    this.facade.loadPage(index);
  }

  // 跳转编辑页
  goToEdit(id?: string) {
    const path = id ? `./detail/${id}` : './detail/new';
    this.router.navigate([path]);
  }

  // 删除确认
  confirmDelete(id: string, name: string) {
    
  }
}