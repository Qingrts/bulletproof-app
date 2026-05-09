// features/comments/components/add-comment/add-comment.component.ts
import { Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-comment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="add-comment-form">
      <textarea
        [(ngModel)]="content"
        placeholder="写下你的评论..."
        rows="3"
        [disabled]="isSubmitting()"
        (keydown.ctrl.enter)="submit()"
        (keydown.meta.enter)="submit()"
      ></textarea>

      <div class="form-actions">
        <span class="hint">提示: Ctrl + Enter 快速提交</span>
        <button
          class="submit-btn"
          (click)="submit()"
          [disabled]="!content.trim() || isSubmitting()"
        >
          @if (isSubmitting()) {
            提交中...
          } @else {
            发表评论
          }
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .add-comment-form {
        background: #f9f9f9;
        padding: 20px;
        border-radius: 12px;
        margin-bottom: 24px;
      }

      textarea {
        width: 100%;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-family: inherit;
        font-size: 14px;
        resize: vertical;
      }

      textarea:focus {
        outline: none;
        border-color: #007bff;
      }

      .form-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 12px;
      }

      .hint {
        font-size: 12px;
        color: #999;
      }

      .submit-btn {
        background: #007bff;
        color: white;
        border: none;
        padding: 8px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        transition: background 0.2s;
      }

      .submit-btn:hover:not(:disabled) {
        background: #0056b3;
      }

      .submit-btn:disabled {
        background: #ccc;
        cursor: not-allowed;
      }
    `,
  ],
})
export class AddCommentComponent {
  readonly commentAdded = output<string>();
  readonly submitting = input(false); // 由父组件控制

  content = '';
  isSubmitting = computed(() => this.submitting());

  submit(): void {
    const trimmed = this.content.trim();
    if (!trimmed || this.isSubmitting()) return;

    this.commentAdded.emit(trimmed);

    // // 模拟异步提交
    // setTimeout(() => {
    //   this.commentAdded.emit(trimmed);
    //   this.content = '';
    //   this.isSubmitting.set(false);
    // }, 500);
  }

  // 提供清除方法
  clearContent(): void {
    this.content = '';
  }
}
