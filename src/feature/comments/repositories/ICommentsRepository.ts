import { CommentDbEntity } from 'src/db/types';
import { CommentResponseType } from 'src/feature/posts/types';
import {
  CommentCreateFields,
  CommentResponseEntity,
  FilterComments,
  LikeCommentFieldType,
} from '../types';

export interface ICommentsRepository {
  getCountComments(filter: FilterComments): Promise<number>;

  getComments(
    filter: FilterComments,
    skip: number,
    limit: number,
  ): Promise<CommentDbEntity[]>;

  createComment(
    newComment: CommentCreateFields,
  ): Promise<CommentResponseEntity>;

  getCommentById(
    id: string,
    userId?: string,
  ): Promise<CommentResponseType | null>;

  getCommentByIdOrThrow(
    id: string,
    userId?: string,
  ): Promise<CommentResponseType | null>;

  deleteCommentById(id: string): Promise<boolean>;

  updateCommentById(
    id: string,
    updateField: { content: string },
  ): Promise<boolean>;

  deleteAllComments(): Promise<void>;

  addOrUpdateLike(
    commentId: string,
    likeItem: LikeCommentFieldType,
  ): Promise<boolean>;

  removeLike(commentId: string, userId: string): Promise<boolean>;
}
