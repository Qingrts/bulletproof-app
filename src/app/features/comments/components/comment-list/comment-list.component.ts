// features/comments/components/comment-list/comment-list.component.ts
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Comment } from '../../models/comment.model';
import { CommentItemComponent } from '../comment-item/comment-item.component';
import { AppInputComponent } from "@shared/components";

@Component({
  selector: 'app-comment-list',
  standalone: true,
  imports: [CommonModule, CommentItemComponent, AppInputComponent],
  template: `
    <app-input></app-input>

    @if (comments().length === 0) {
      <div class="empty-state">暂无评论，成为第一个评论的人吧 ✨</div>
    } @else {
      <div class="comment-list">
        @for (comment of comments(); track comment.id) {
          <app-comment-item [comment]="comment" (likeClicked)="likeClicked.emit($event)" />
        }
      </div>
    }
    <div class="min-h-screen"></div>

    @defer (on viewport; prefetch on idle) {
      <div>loaded</div>
    } @placeholder {
      <div>图表加载中...</div>
    }
  `,
  styles: [
    `
      .empty-state {
        text-align: center;
        padding: 40px;
        color: #666;
        background: #f9f9f9;
        border-radius: 8px;
      }

      .comment-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
    `,
  ],
})
export class CommentListComponent {
  readonly comments = input.required<Comment[]>();
  readonly likeClicked = output<string>();
}
