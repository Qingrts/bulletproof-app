import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { UserFacade } from './user.facade';
import { UserService } from './user.service';
import { NotificationAdapter } from '../../core/services/ui/notification.adapter';
import { of, throwError } from 'rxjs';

describe('UserFacade (Vitest)', () => {
  let facade: UserFacade;
  // 💡 使用 vi.mocked 获得更好的类型提示
  const mockUserService = {
    getAll: vi.fn(),
    delete: vi.fn()
  };
  const mockNotify = {
    success: vi.fn(),
    error: vi.fn()
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserFacade,
        { provide: UserService, useValue: mockUserService },
        { provide: NotificationAdapter, useValue: mockNotify }
      ]
    });

    mockUserService.getAll.mockReturnValue(of([]));
    facade = TestBed.inject(UserFacade);
  });

  it('应该能正确加载用户列表并更新 Signal', async () => {
    const mockUsers = [{ id: '1', username: 'Vitest User' }];
    mockUserService.getAll.mockReturnValue(of(mockUsers));

    facade.reload();

    // 💡 直接验证 Angular Signal 的值
    expect(facade.users()).toEqual(mockUsers);
    expect(facade.isLoading()).toBe(false);
  });

  it('处理删除失败的副作用', () => {
    mockUserService.delete.mockReturnValue(throwError(() => new Error('API Fail')));
    
    facade.deleteUser('123');

    // 验证 UI 解耦后的适配器是否被正确调用
    expect(mockNotify.error).toHaveBeenCalledWith('删除失败');
    expect(facade.isLoading()).toBe(false);
  });
});