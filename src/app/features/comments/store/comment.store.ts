// features/comments/store/comment.store.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { Comment, CreateCommentInput } from '../models/comment.model';
import { CommentService } from '../services/comment.service';
import { catchError, finalize, tap } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CommentStore {
  private commentService = inject(CommentService);

  // 私有状态 signals
  private commentsSignal = signal<Comment[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // 公共只读 computed 值
  readonly comments = this.commentsSignal.asReadonly();
  readonly isLoading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  // 派生状态：计算评论总数
  readonly totalComments = computed(() => this.commentsSignal().length);

  // 派生状态：按时间倒序排列
  readonly sortedComments = computed(() =>
    [...this.commentsSignal()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
  );

  // Actions
  loadComments(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.commentService
      .getCommentsByPost()
      .pipe(
        catchError((err) => {
          this.errorSignal.set(err.message || '加载评论失败');
          return of([]);
        }),
        finalize(() => this.loadingSignal.set(false)),
      )
      .subscribe((comments) => {
        this.commentsSignal.set(comments);
      });
  }

  addComment(input: CreateCommentInput): Observable<Comment> {
    const tempId = crypto.randomUUID();
    const newComment = {
      ...input,
      id: tempId,
      createdAt: new Date(),
      likes: 0,
    };

    // 乐观更新
    this.commentsSignal.update((prev) => [newComment, ...prev]);

    return this.commentService.createComment(input).pipe(
      tap((serverComment) => {
        // 用服务器的真实数据替换临时数据
        this.commentsSignal.update((prev) =>
          prev.map((c) => (c.id === tempId ? serverComment : c)),
        );
      }),
      catchError((err) => {
        // 回滚
        this.commentsSignal.update((prev) => prev.filter((c) => c.id !== tempId));
        this.errorSignal.set(err.message || '添加评论失败');
        return throwError(() => err);
      })
    );
  }

  likeComment(commentId: string): void {
    this.commentsSignal.update((prev) =>
      prev.map((comment) =>
        comment.id === commentId ? { ...comment, likes: comment.likes + 1 } : comment,
      ),
    );

    this.commentService.likeComment(commentId).subscribe({
      error: () => {
        // 回滚
        this.commentsSignal.update((prev) =>
          prev.map((comment) =>
            comment.id === commentId ? { ...comment, likes: comment.likes - 1 } : comment,
          ),
        );
      },
    });
  }
}
