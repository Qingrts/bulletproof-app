import { Injectable, inject, signal, computed } from "@angular/core";
import { BehaviorSubject, tap, switchMap, catchError, of, exhaustMap, finalize } from "rxjs";
import { NotificationAdapter } from "../../core/services/ui/notification.adapter";
import { User } from "./models/user.model";
import { UserService } from "./user.service";

@Injectable()
export class UserFacade {
  private userApi = inject(UserService);
  private notify = inject(NotificationAdapter); // UI 解耦后的通知
  
  // 状态管理：使用 Signals
  private state = signal<{ list: User[]; loading: boolean }>({
    list: [],
    loading: false
  });

  // 暴露给组件的只读信号
  readonly users = computed(() => this.state().list);
  readonly isLoading = computed(() => this.state().loading);

  private reloadSubject = new BehaviorSubject<void>(undefined);

  constructor() {
    // 异步解耦：通过流控制加载逻辑
    // switchMap (最常用)：如果新请求来了，自动取消掉还没完成的旧请求。
    // exhaustMap：如果当前请求没完成，直接忽略掉新来的点击（防抖增强版）。
    // concatMap：不管点多快，按顺序一个一个排队执行。
    this.reloadSubject.pipe(
      tap(() => this.patchState({ loading: true })),
      switchMap(() => this.userApi.getAll().pipe(
        catchError(err => {
          this.notify.error('获取用户列表失败');
          return of([]);
        })
      ))
    ).subscribe(list => {
      this.patchState({ list, loading: false });
    });
  }

  reload() { this.reloadSubject.next(); }

  deleteUser(id: string) {
    // 使用 exhaustMap 防止重复点击删除
    of(id).pipe(
      exhaustMap(uid => this.userApi.delete(uid)),
      tap(() => this.notify.success('删除成功'))
    ).subscribe(() => this.reload());
  }

  private patchState(slice: Partial<{ list: User[]; loading: boolean }>) {
    this.state.update(s => ({ ...s, ...slice }));
  }

  /**
   * 保存用户（新增或更新）
   * @param user 表单数据
   * @param isEdit 是否为编辑模式
   */
  saveUser(user: Partial<User>, isEdit: boolean) {
    const request = isEdit 
      ? this.userApi.update(user.id!, user) 
      : this.userApi.create(user);

    this.patchState({ loading: true });

    request.pipe(
      // 异步解耦：处理请求并自动恢复 loading 状态
      finalize(() => this.patchState({ loading: false }))
    ).subscribe({
      next: () => {
        this.notify.success(isEdit ? '更新成功' : '创建成功');
        this.reload(); // 自动刷新列表
        this.closeDrawer(); // 假设我们用侧边栏展示表单
      },
      error: () => this.notify.error('保存失败')
    });
  }

  closeDrawer() {
    
  }
}