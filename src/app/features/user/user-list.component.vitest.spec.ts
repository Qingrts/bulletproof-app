import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserListComponent } from './user-list.component';
import { UserFacade } from './user.facade';
import { By } from '@angular/platform-browser';
import { signal, NO_ERRORS_SCHEMA, computed } from '@angular/core';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationAdapter } from '../../core/services/ui/notification.adapter';

describe('UserListComponent (Native TestBed)', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;


  const stateSignal = signal({
    list: [{ id: '1', username: 'Admin', email: 'a@test.com', role: 'admin' }],
    loading: false
  });

  // 定义一个生成初始状态的函数
  const createMockFacade = () => {


    return {
      state: stateSignal,
      // 假设组件中用到了 facade.users() 这一计算属性
      users: computed(() => stateSignal().list),
      isLoading: computed(() => stateSignal().loading),
      reload: vi.fn(),
      deleteUser: vi.fn()
    };
  };

  let mockFacade: ReturnType<typeof createMockFacade>;

  beforeEach(async () => {
    mockFacade = createMockFacade() as any; // 重新初始化

    await TestBed.configureTestingModule({
      imports: [UserListComponent],
    })
      .overrideComponent(UserListComponent, {
        set: {
          providers: [
            { provide: UserFacade, useValue: mockFacade },
            {
              provide: NotificationAdapter,
              useValue: { success: vi.fn(), error: vi.fn() }
            }
          ]
        }
      }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('当加载状态为 true 时，按钮应该处于禁用状态', () => {
    // 使用正确的 Signal 更新方式
    mockFacade.state.set({
      list: [],
      loading: true
    });

    fixture.detectChanges();

    const refreshBtn = fixture.debugElement.query(By.css('button')).nativeElement;
    expect(refreshBtn.disabled).toBe(true);
  });

  it('应该在表格中正确渲染用户数据', async () => {
    const mockData = [
      { id: '1', username: 'Admin', email: 'a@test.com', role: 'admin' },
      { id: '2', username: 'Editor', email: 'e@test.com', role: 'editor' }
    ];

    mockFacade.state.set({
      list: mockData,
      loading: false
    });

    fixture.detectChanges();

    await fixture.whenStable();

    const tableRows = fixture.debugElement.queryAll(By.css('tbody tr'));

    // 验证行数
    expect(tableRows.length).toBe(2);
    // 验证内容
    const content = tableRows[0].nativeElement.textContent;
    expect(content).toContain('Admin');
    expect(content).toContain('a@test.com');

    const content1 = tableRows[1].nativeElement.textContent;
    expect(content1).toContain('Editor');
    expect(content1).toContain('e@test.com');
  });
});