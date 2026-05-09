// features/comments/models/comment.model.ts
export interface Comment {
  id: string;
  postId?: string;
  content: string;
  author?: string;
  createdAt: Date;
  updatedAt?: Date;
  likes: number;
  likedByUser?: boolean;
  parentId?: string | null;
  userId?: string;
}

// 类型安全的创建类型
export type CreateCommentInput = Omit<Comment, 'id' | 'createdAt' | 'likes'>;

// 类型守卫函数
export function isValidComment(comment: unknown): comment is Comment {
  const c = comment as Comment;
  return !!(c?.id && c?.content && c?.author && c?.createdAt);
}
