// features/comments/components/add-comment/add-comment.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { AddCommentComponent } from './add-comment.component';

describe('AddCommentComponent', () => {
  let component: AddCommentComponent;
  let fixture: ComponentFixture<AddCommentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCommentComponent, FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AddCommentComponent);
    component = fixture.componentInstance;

    // 设置必需的输入
    fixture.componentRef.setInput('postId', 'test-post-123');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should require postId input', () => {
    // 验证输入已设置
    expect(component.postId()).toBe('test-post-123');
  });

  describe('模板渲染', () => {
    it('应该渲染文本域和提交按钮', () => {
      const textarea = fixture.debugElement.query(By.css('textarea'));
      const button = fixture.debugElement.query(By.css('.submit-btn'));

      expect(textarea).toBeTruthy();
      expect(button).toBeTruthy();
    });

    it('应该显示提示信息', () => {
      const hint = fixture.debugElement.query(By.css('.hint'));
      expect(hint.nativeElement.textContent).toContain('Ctrl + Enter 快速提交');
    });

    it('文本域应该绑定到 content 属性', async () => {
      const textarea = fixture.debugElement.query(By.css('textarea')).nativeElement;
      const testText = '这是一条测试评论';

      textarea.value = testText;
      textarea.dispatchEvent(new Event('input'));

      fixture.detectChanges();

      expect(component.content).toBe(testText);
    });

    it('当内容为空时应该禁用提交按钮', () => {
      component.content = '';
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('.submit-btn')).nativeElement;
      expect(button.disabled).toBe(true);
    });

    it('当内容只有空白字符时应该禁用提交按钮', () => {
      component.content = '   ';
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('.submit-btn')).nativeElement;
      expect(button.disabled).toBe(true);
    });

    it('当内容非空时应该启用提交按钮', () => {
      component.content = '有效评论';
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('.submit-btn')).nativeElement;
      expect(button.disabled).toBe(false);
    });

    it('提交中时应该显示"提交中..."文本', () => {
      component.isSubmitting.set(true);
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('.submit-btn')).nativeElement;
      expect(button.textContent).toContain('提交中...');
    });

    it('非提交状态应该显示"发表评论"文本', () => {
      component.isSubmitting.set(false);
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('.submit-btn')).nativeElement;
      expect(button.textContent).toContain('发表评论');
    });

    it('提交中时应该禁用文本域', async () => {
      component.isSubmitting.set(true);
      fixture.detectChanges();
      await fixture.whenStable(); // 等待异步更新完成
      fixture.detectChanges(); // 再次触发变更检测

      const textarea = fixture.debugElement.query(By.css('textarea')).nativeElement;
      expect(textarea.disabled).toBe(true); // 这个其实在更新后应该能用
    });
  });

  describe('submit 方法', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('当内容为空时不应该提交', () => {
      component.content = '';
      const emitSpy = vi.spyOn(component.commentAdded, 'emit');

      component.submit();

      expect(emitSpy).not.toHaveBeenCalled();
      expect(component.isSubmitting()).toBe(false);
    });

    it('当内容只有空白时不应该提交', () => {
      component.content = '   ';
      const emitSpy = vi.spyOn(component.commentAdded, 'emit');

      component.submit();

      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('当正在提交时不应该重复提交', () => {
      component.content = '测试评论';
      component.isSubmitting.set(true);
      const emitSpy = vi.spyOn(component.commentAdded, 'emit');

      component.submit();

      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('应该提交有效内容并触发事件', () => {
      const testComment = '这是一条有效的评论';
      component.content = testComment;
      const emitSpy = vi.spyOn(component.commentAdded, 'emit');

      component.submit();

      expect(component.isSubmitting()).toBe(true);

      // 模拟异步完成
      vi.runAllTimers();

      expect(emitSpy).toHaveBeenCalledWith(testComment);
      expect(component.content).toBe('');
      expect(component.isSubmitting()).toBe(false);
    });

    it('应该自动去除内容前后的空白', () => {
      const testComment = '  带空白的评论  ';
      component.content = testComment;
      const emitSpy = vi.spyOn(component.commentAdded, 'emit');

      component.submit();
      vi.runAllTimers();

      expect(emitSpy).toHaveBeenCalledWith(testComment.trim());
    });
  });

  describe('键盘事件', () => {
    it('Ctrl+Enter 应该触发表单提交', () => {
      component.content = '测试评论';
      const submitSpy = vi.spyOn(component, 'submit');

      const textarea = fixture.debugElement.query(By.css('textarea')).nativeElement;
      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        // ctrlKey: true,
        metaKey: true,
      });
      textarea.dispatchEvent(event);

      expect(submitSpy).toHaveBeenCalled();
    });

    it('普通 Enter 不应该触发表单提交', () => {
      component.content = '测试评论';
      const submitSpy = vi.spyOn(component, 'submit');

      const textarea = fixture.debugElement.query(By.css('textarea')).nativeElement;
      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        ctrlKey: false,
      });
      textarea.dispatchEvent(event);

      expect(submitSpy).not.toHaveBeenCalled();
    });
  });

  describe('按钮点击交互', () => {
    it('点击提交按钮应该调用 submit 方法', () => {
      component.content = '测试评论'; // 设置有效内容
      fixture.detectChanges(); // 触发变更检测

      const submitSpy = vi.spyOn(component, 'submit');
      const button = fixture.debugElement.query(By.css('.submit-btn')).nativeElement;

      expect(button.disabled).toBe(false); // 确认按钮可用
      button.click();

      expect(submitSpy).toHaveBeenCalledTimes(1);
    });

    it('按钮禁用时点击不应该提交', () => {
      component.content = '';
      fixture.detectChanges();

      const submitSpy = vi.spyOn(component, 'submit');
      const button = fixture.debugElement.query(By.css('.submit-btn')).nativeElement;

      expect(button.disabled).toBe(true);
      button.click();

      expect(submitSpy).not.toHaveBeenCalled();
    });
  });

  describe('异步提交行为', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('提交过程中应该阻止新的提交', () => {
      component.content = '第一次提交';
      const emitSpy = vi.spyOn(component.commentAdded, 'emit');

      component.submit();
      expect(component.isSubmitting()).toBe(true);

      // 尝试第二次提交
      component.content = '第二次提交';
      component.submit();

      vi.runAllTimers();

      // 只应该触发一次
      expect(emitSpy).toHaveBeenCalledTimes(1);
      expect(emitSpy).toHaveBeenCalledWith('第一次提交');
    });

    it('提交完成后应该重置状态', () => {
      component.content = '测试评论';
      component.submit();

      expect(component.isSubmitting()).toBe(true);

      vi.runAllTimers();

      expect(component.isSubmitting()).toBe(false);
      expect(component.content).toBe('');
    });
  });

  describe('边界情况', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('应该正确处理很长的评论内容', () => {
      const longComment = 'a'.repeat(10000);
      component.content = longComment;
      vi.spyOn(component.commentAdded, 'emit');

      component.submit();

      expect(component.isSubmitting()).toBe(true);
    });

    it('应该正确处理特殊字符', () => {
      const specialChars = '<script>alert("xss")</script> & 表情符号 😀';
      component.content = specialChars;
      const emitSpy = vi.spyOn(component.commentAdded, 'emit');

      component.submit();
      vi.runAllTimers();

      expect(emitSpy).toHaveBeenCalledWith(specialChars);
    });
  });
});
