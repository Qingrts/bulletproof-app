// features/comments/comments-feature.component.ts
import { Component, input, OnInit, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentStore } from './store/comment.store';
import { CommentListComponent } from './components/comment-list/comment-list.component';
import { AddCommentComponent } from './components/add-comment/add-comment.component';

@Component({
  selector: 'app-comments-feature',
  standalone: true,
  imports: [CommonModule, CommentListComponent, AddCommentComponent],
  template: `
    <div class="comments-container">
      <h2>评论 ({{ store.totalComments() }})</h2>

      <!-- 添加评论表单 -->
      <app-add-comment [submitting]="isSubmitting()" (commentAdded)="onCommentAdded($event)" />

      <!-- 错误提示 -->
      @if (store.error()) {
        <div class="error-message" role="alert">
          {{ store.error() }}
          <button (click)="retryLoad()" class="cursor-pointer">重试</button>
        </div>
      }

      <!-- 加载状态 -->
      @if (store.isLoading()) {
        <div class="loading-state" aria-label="加载中">
          <div class="spinner"></div>
        </div>
      }

      <button (click)="store.loadComments()">refersh</button>

      <!-- 评论列表 -->
      @if (!store.isLoading()) {
        <app-comment-list
          [comments]="store.sortedComments()"
          (likeClicked)="onLikeComment($event)"
        />
      }
    </div>
  `,
  styles: [
    `
      .comments-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }

      .error-message {
        background: #fee;
        border: 1px solid #fcc;
        color: #c33;
        padding: 12px;
        border-radius: 8px;
        margin: 16px 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .loading-state {
        display: flex;
        justify-content: center;
        padding: 40px;
      }

      .spinner {
        width: 40px;
        height: 40px;
        border: 3px solid #e0e0e0;
        border-top-color: #007bff;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class CommentsFeatureComponent implements OnInit {
  @ViewChild(AddCommentComponent) addCommentComponent!: AddCommentComponent;

  store = inject(CommentStore);

  isSubmitting = signal(false);

  ngOnInit(): void {
    this.retryLoad();
  }

  onCommentAdded(content: string): void {
    this.isSubmitting.set(true);
    this.store.addComment({
      content,
      userId: '-99999',
      author: '当前用户', // 实际应从 AuthService 获取
      parentId: null,
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.addCommentComponent.clearContent();
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
    
  }

  onLikeComment(commentId: string): void {
    this.store.likeComment(commentId);
  }

  retryLoad(): void {
    this.store.loadComments();
  }
}
