import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { AppInputComponent } from "@shared/components";
import { UserFacade } from "./user.facade";
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, NzTableModule, NzButtonModule, AppInputComponent],
  providers: [UserFacade],
  template: `
    <div class="page-header">
      <app-input placeholder="搜索用户..." (ngModelChange)="onSearch($event)"></app-input>
      {{ facade.isLoading() }}
      <button nz-button nzType="primary" (click)="facade.reload()" [disabled]="facade.isLoading()">
        刷新数据
      </button>
    </div>

    <nz-table #basicTable [nzData]="facade.users()" [nzLoading]="facade.isLoading()">
      <thead>
        <tr>
          <th>用户名</th>
          <th>邮箱</th>
          <th>角色</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        @for (data of basicTable.data; track data.id) {
          <tr>
            <td>{{ data.username }}</td>
            <td>{{ data.email }}</td>
            <td>{{ data.role }}</td>
            <td>
              <button nz-button nzType="link" (click)="facade.deleteUser(data.id)">删除</button>
            </td>
          </tr>
        }
      </tbody>
    </nz-table>
  `
})
export class UserListComponent {
  readonly facade = inject(UserFacade);

  onSearch(t: Event) {
    // 可以在这里继续调用 facade 的搜索逻辑
  }
}