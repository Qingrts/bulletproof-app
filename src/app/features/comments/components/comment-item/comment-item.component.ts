// features/comments/components/comment-item/comment-item.component.ts
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Comment } from '../../models/comment.model';

@Component({
  selector: 'app-comment-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="comment-card">
      <div class="comment-header">
        <strong class="author">{{ comment().author }}</strong>
        <time class="date">{{ comment().createdAt | date: 'yyyy-MM-dd HH:mm' }}</time>
      </div>

      <p class="content">{{ comment().content }}</p>

      <div class="comment-actions">
        <button
          class="like-btn"
          (click)="likeClicked.emit(comment().id)"
          [attr.aria-label]="'点赞，当前' + comment().likes + '个赞'"
        >
          ❤️ {{ comment().likes }}
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .comment-card {
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 12px;
        padding: 16px;
        transition: box-shadow 0.2s;
      }

      .comment-card:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .comment-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        font-size: 14px;
      }

      .author {
        color: #007bff;
      }

      .date {
        color: #999;
      }

      .content {
        margin: 12px 0;
        line-height: 1.5;
        color: #333;
      }

      .like-btn {
        background: none;
        border: none;
        padding: 4px 8px;
        cursor: pointer;
        border-radius: 6px;
        transition: background 0.2s;
      }

      .like-btn:hover {
        background: #f0f0f0;
      }
    `,
  ],
})
export class CommentItemComponent {
  readonly comment = input.required<Comment>();
  readonly likeClicked = output<string>();
}
