// features/comments/services/comment.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable, retry, timeout } from 'rxjs';
import { map } from 'rxjs/operators';
import { Comment, CreateCommentInput } from '../models/comment.model';
import { ApiBaseService } from '../../../core/services/api/api-base.service';

interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

@Injectable({ providedIn: 'root' })
export class CommentService extends ApiBaseService {
  private readonly apiUrl = '/api/comments';
  private readonly REQUEST_TIMEOUT = 10000; // 10秒超时
  private readonly MAX_RETRIES = 2;

  getCommentsByPost(): Observable<Comment[]> {
    return this.get<Comment[]>(`${this.apiUrl}`).pipe(map(res => res.data));
  }

  createComment(input: CreateCommentInput): Observable<Comment> {
    return this.post<Comment>(this.apiUrl, input).pipe(map(res => res.data));
  }

  likeComment(commentId: string): Observable<ApiResponse<Comment>> {
    return this.post<ApiResponse<Comment>>(`${this.apiUrl}/${commentId}/like`, {}).pipe(map(res => res.data));
  }

  deleteComment(commentId: string): Observable<void> {
    return this.delete<void>(`${this.apiUrl}/${commentId}`).pipe(map(res => res.data));
  }
}
