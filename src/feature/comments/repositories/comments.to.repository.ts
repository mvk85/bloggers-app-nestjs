import { CommentResponseType } from 'src/feature/posts/types';
import {
  CommentCreateFields,
  CommentResponseEntity,
  LikeCommentFieldType,
} from '../types';
import { ICommentsRepository } from './ICommentsRepository';

export class CommentsToRepository implements ICommentsRepository {
  getCountComments(postId: string): Promise<number> {
    throw new Error('Method not implemented.');
  }
  getComments(
    postId: string,
    skip: number,
    limit: number,
    userId?: string,
  ): Promise<CommentResponseType[]> {
    throw new Error('Method not implemented.');
  }
  createComment(
    newComment: CommentCreateFields,
  ): Promise<CommentResponseEntity> {
    throw new Error('Method not implemented.');
  }
  getCommentById(id: string, userId?: string): Promise<CommentResponseType> {
    throw new Error('Method not implemented.');
  }
  getCommentByIdOrThrow(
    id: string,
    userId?: string,
  ): Promise<CommentResponseType> {
    throw new Error('Method not implemented.');
  }
  deleteCommentById(id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  updateCommentById(
    id: string,
    updateField: { content: string },
  ): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  async deleteAllComments(): Promise<void> {
    // throw new Error('Method not implemented.');
  }
  addOrUpdateLike(
    commentId: string,
    likeItem: LikeCommentFieldType,
  ): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  removeLike(commentId: string, userId: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
