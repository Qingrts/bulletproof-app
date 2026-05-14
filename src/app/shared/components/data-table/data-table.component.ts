import { Component, input, output, contentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzImageModule } from 'ng-zorro-antd/image';
import { TableColumn } from './models/table.model';

@Component({
  selector: 'app-shared-data-table',
  standalone: true,
  imports: [CommonModule, NzTableModule, NzTagModule, NzImageModule],
  template: `
    <nz-table
      #basicTable
      [nzData]="data()"
      [nzLoading]="loading()"
      [nzTotal]="total()"
      [nzPageIndex]="pageIndex()"
      [nzPageSize]="pageSize()"
      [nzFrontPagination]="false"
      (nzPageIndexChange)="pageIndexChange.emit($event)"
      [nzScroll]="{ x: '1000px' }"
    >
      <thead>
        <tr>
          @for (col of columns(); track col.key) {
            <th [nzWidth]="col.width || null">{{ col.label }}</th>
          }
          <!-- 如果外部提供了操作列模板，则显示操作头 -->
          @if (actionTemplate()) {
            <th nzRight nzWidth="120px">操作</th>
          }
        </tr>
      </thead>
      <tbody>
        @for (item of basicTable.data; track item.id) {
          <tr>
            @for (col of columns(); track col.key) {
              <td>
                @switch (col.type) {
                  @case ('image') {
                    <img nz-image width="40px" height="40px" [nzSrc]="$any(item)[col.key]" style="border-radius: 4px" />
                  }
                  @case ('badge') {
                    <nz-tag [nzColor]="$any(item)[$any(col.key) + 'Color'] || 'blue'">
                      {{ $any(item)[col.key] }}
                    </nz-tag>
                  }
                  <!-- 如果列类型是 template，则使用外部传入的 cellTemplate -->
                  @case ('template') {
                    <ng-container 
                      *ngTemplateOutlet="cellTemplate(); context: { $implicit: item, column: col }">
                    </ng-container>
                  }
                  @default {
                    {{ $any(item)[col.key] }}
                  }
                }
              </td>
            }
            <!-- 操作列单元格 -->
            @if (actionTemplate()) {
              <td nzRight>
                <ng-container *ngTemplateOutlet="actionTemplate(); context: { $implicit: item }"></ng-container>
              </td>
            }
          </tr>
        }
      </tbody>
    </nz-table>
  `,
  styles: [`
    :host { display: block; background: white; padding: 16px; border-radius: 8px; }
  `]
})
export class DataTableComponent<T extends { id: string }> {
  // 核心输入 (Signal)
  data = input.required<T[]>();
  columns = input.required<TableColumn<T>[]>();
  loading = input<boolean>(false);
  total = input<number>(0);
  pageIndex = input<number>(1);
  pageSize = input<number>(10);

  // 事件输出
  pageIndexChange = output<number>();

  // 1. 用于自定义某个单元格内容的模板 (可选)
  cellTemplate = contentChild<TemplateRef<any>>('cellTemplate');
  
  // 2. 用于操作列的模板 (可选)
  actionTemplate = contentChild<TemplateRef<any>>('actionTemplate');
}